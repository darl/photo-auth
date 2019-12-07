
class Session:
    """
    Holds refs to session state
    """
    def __init__(self):
        self.channel = None
        self.timer = None
        self.track = None

    def cancel_timer(self):
        if self.timer is not None:
            self.timer.cancel()

    def close(self):
        self.cancel_timer()
