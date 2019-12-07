import random
import time

import classificator
from timer import Timer

TIMER_INTERVAL = 0.6


class Session:
    """
    Holds auth session state
    """

    def __init__(self, state, pc):
        self.state = state
        self.pc = pc
        self.channel = None
        self.track = None
        self.last_frame = None
        self.timer = Timer(TIMER_INTERVAL, self.tick)
        self.last_message = None
        self.res = None
        self.bounds = None
        # self.hands

        self.state_start = time.time()

    async def tick(self):
        if self.last_frame:
            try:
                position = self.get_classificator_position(self.state)
                image = self.last_frame.to_image()
                self.bounds, model_id = classificator.get_bounds(image, position)
                self.res = classificator.predict(image, self.bounds, model_id)
            except Exception as err:
                print(err)

        try:
            elapsed = time.time() - self.state_start
            if self.state.startswith("show") and elapsed > State.SHOW_TIMEOUT:
                self.state = State.ABORT
            if self.state.startswith("hand") and elapsed > State.HAND_TIMEOUT:
                self.state = State.ABORT

            if self.res:
                self.res = False
                self.state_start = time.time()
                if self.state == State.SHOW_PASSPORT:
                    self.state = State.SHOW_PASSPORT_2
                elif self.state == State.SHOW_PASSPORT_2:
                    self.state = State.SHOW_PASSPORT_3
                elif self.state == State.SHOW_PASSPORT_3:
                    self.state = random.choice(State.HANDS)
                elif self.state.startswith("hand"):
                    self.state = random.choice(State.HANDS)

            if self.channel and self.last_message != self.state:
                self.channel.send(self.state)
                self.last_message = self.state

            if self.state == State.ABORT or self.state == State.SUCCESS:
                await self.close()
        except Exception as err:
            print(err)
        finally:
            self.timer = Timer(TIMER_INTERVAL, self.tick)

    @staticmethod
    def get_classificator_position(state):
        if state == State.SHOW_PASSPORT:
            return classificator.Position.PASSPORT_LEFT
        elif state == State.SHOW_PASSPORT_2:
            return classificator.Position.PASSPORT_RIGHT
        elif state == State.SHOW_PASSPORT_3:
            return classificator.Position.PASSPORT_CLOSE

        elif state == State.HAND_TOP_LEFT:
            return classificator.Position.HAND_TOP_LEFT
        elif state == State.HAND_TOP_RIGHT:
            return classificator.Position.HAND_TOP_RIGHT
        elif state == State.HAND_BOTTOM_LEFT:
            return classificator.Position.HAND_BOTTOM_LEFT
        elif state == State.HAND_BOTTOM_RIGHT:
            return classificator.Position.HAND_BOTTOM_RIGHT
        else:
            return None

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
    HAND_TOP_RIGHT = "hand_top_right"
    HAND_BOTTOM_LEFT = "hand_bottom_left"
    HAND_BOTTOM_RIGHT = "hand_bottom_right"

    HANDS = [
        HAND_TOP_LEFT, HAND_TOP_RIGHT, HAND_BOTTOM_LEFT, HAND_BOTTOM_RIGHT
    ]

    HAND_TIMEOUT = 15

    ABORT = "abort"
    SUCCESS = "success"

    INIT = SHOW_PASSPORT
