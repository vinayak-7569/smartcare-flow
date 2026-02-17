# backend/ai_agent/metrics.py
from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field
from typing import Dict, List


def _percentile(values: List[float], p: int) -> float:
    if not values:
        return 0.0
    xs = sorted(values)
    k = (len(xs) - 1) * (p / 100.0)
    f = int(k)
    c = min(f + 1, len(xs) - 1)
    if f == c:
        return float(xs[f])
    d0 = xs[f] * (c - k)
    d1 = xs[c] * (k - f)
    return float(d0 + d1)


@dataclass
class AgentMetrics:
    """
    Thread-safe minimal metrics store.
    Note: in multi-worker deployments each worker has its own metrics instance.
    """
    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    decisions_total: int = 0
    decisions_by_priority: Dict[str, int] = field(default_factory=dict)

    last_latency_ms: float = 0.0
    avg_latency_ms: float = 0.0
    p95_latency_ms: float = 0.0

    _latencies_ms: List[float] = field(default_factory=list, repr=False)

    def observe(self, priority: str, latency_ms: float) -> None:
        with self._lock:
            self.decisions_total += 1
            self.decisions_by_priority[priority] = self.decisions_by_priority.get(priority, 0) + 1
            self.last_latency_ms = float(latency_ms)

            self._latencies_ms.append(float(latency_ms))
            if len(self._latencies_ms) > 5000:
                self._latencies_ms = self._latencies_ms[-2000:]

            self.avg_latency_ms = sum(self._latencies_ms) / max(len(self._latencies_ms), 1)
            self.p95_latency_ms = _percentile(self._latencies_ms, 95)


class _Timer:
    def _init_(self) -> None:
        self._t0 = time.perf_counter()

    def ms(self) -> float:
        return (time.perf_counter() - self._t0) * 1000.0


def timer() -> _Timer:
    return _Timer()
