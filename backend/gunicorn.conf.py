"""One process shares graph caches and the animal-addition lock."""

import os

bind = f"[::]:{os.getenv('PORT', '8080')}"
workers = 1
worker_class = "gthread"
threads = 4
timeout = 120
accesslog = "-"
errorlog = "-"
