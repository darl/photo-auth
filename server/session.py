from timer import Timer

TIMER_INTERVAL = 1


class Session:
    """
    Holds refs to session state
    """

    def __init__(self):
        self.channel = None
        self.timer = None
        self.track = None

    async def tick(self):
        try:
            if self.channel is not None:
                pass
                self.channel.send("show_passport")
        finally:
            self.timer = Timer(TIMER_INTERVAL, self.tick)

    def close(self):
        if self.timer is not None:
            self.timer.cancel()
