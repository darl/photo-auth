import time

from timer import Timer

TIMER_INTERVAL = 1


class Session:
    """
    Holds auth session state
    """

    def __init__(self, state, pc):
        self.state = state
        self.pc = pc
        self.channel = None
        self.track = None
        self.timer = Timer(TIMER_INTERVAL, self.tick)
        self.last_message = None
        self.state_start = time.time()

    async def tick(self):
        try:
            elapsed = time.time() - self.state_start
            if self.state.startswith("show") and elapsed > State.SHOW_TIMEOUT:
                self.state = State.ABORT
            if self.state.startswith("hand") and elapsed > State.HAND_TIMEOUT:
                self.state = State.ABORT

            if self.channel and self.last_message != self.state:
                self.channel.send(self.state)
                self.last_message = self.state

            if self.state == State.ABORT:
                await self.close()
        finally:
            self.timer = Timer(TIMER_INTERVAL, self.tick)

    async def close(self):
        if self.timer:
            self.timer.cancel()
        await self.pc.close()


class State:
    SHOW_PASSPORT = "show_passport"
    SHOW_PASSPORT_2 = "show_passport_2"
    SHOW_PASSPORT_3 = "show_passport_3"

    SHOW_TIMEOUT = 300

    HAND_TOP_LEFT = "hand_top_left"
    HAND_TOP_right = "hand_top_right"
    HAND_BOTTOM_LEFT = "hand_bottom_left"
    HAND_BOTTOM_right = "hand_bottom_right"

    HAND_TIMEOUT = 15

    ABORT = "abort"
    SUCCESS = "success"

    INIT = SHOW_PASSPORT
