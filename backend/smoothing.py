# EMA smoothing
class EMAFilter:
    def __init__(self, alpha=0.3):
        self.alpha = alpha
        self._x = self._y = None

    def smooth(self, x, y):
        if self._x is None:
            self._x, self._y = x, y
        else:
            self._x = self.alpha * x + (1 - self.alpha) * self._x
            self._y = self.alpha * y + (1 - self.alpha) * self._y
        return self._x, self._y

    def reset(self):
        self._x = self._y = None
