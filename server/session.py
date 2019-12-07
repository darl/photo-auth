import random
import time
import logging

import classificator
from timer import Timer

TIMER_INTERVAL = 0.6
RESULT_THRESHOLD = 2


class Session:
    """
    Holds auth session state
    """

    def __init__(self, state, pc):
        self.state = state
        self.pc = pc
        self.channel = None
        self.track = None
        self.last_image = None
        self.timer = Timer(TIMER_INTERVAL, self.tick)
        self.last_message = None
        self.res = 0
        self.size = None
        self.bounds = None
        # self.hands

        self.state_start = time.time()

    def get_bounds(self):
        return classificator.get_bounds(self.last_image, self.get_classificator_position(self.state))

    def update_resolution(self):
        if self.last_image:
            try:
                if self.size != self.last_image.size:
                    self.size = self.last_image.size
                    logging.info(self.size)

                self.bounds, model_id = self.get_bounds()
                if classificator.predict(self.last_image, self.bounds, model_id):
                    self.res += 1
                else:
                    self.res = 0
            except Exception as err:
                print(err)

    async def update_state(self):
        try:
            elapsed = time.time() - self.state_start
            if self.state.startswith("show") and elapsed > State.SHOW_TIMEOUT:
                self.state = State.ABORT
            if self.state.startswith("hand") and elapsed > State.HAND_TIMEOUT:
                self.state = State.ABORT

            if self.state != State.ABORT and self.res >= RESULT_THRESHOLD:
                self.res = 0
                self.state_start = time.time()
                if self.state == State.SHOW_PASSPORT:
                    self.state = State.SHOW_PASSPORT_2
                elif self.state == State.SHOW_PASSPORT_2:
                    self.state = State.SHOW_PASSPORT_3
                elif self.state == State.SHOW_PASSPORT_3:
                    self.state = self.next_random_hand()
                elif self.state.startswith("hand"):
                    self.state = self.next_random_hand()

            if self.channel and self.last_message != self.state:
                self.channel.send(self.state)
                self.last_message = self.state
                self.bounds, _ = self.get_bounds()

            if self.state == State.ABORT or self.state == State.SUCCESS:
                await self.close()
        except Exception as err:
            print(err)

    async def tick(self):
        if time.time() - self.state_start > TIMER_INTERVAL*2:
            self.update_resolution()
            await self.update_state()

        self.timer = Timer(TIMER_INTERVAL, self.tick)

    @staticmethod
    def get_classificator_position(state):
        if state == State.SHOW_PASSPORT:
            return classificator.Position.PASSPORT_CLOSE
        elif state == State.SHOW_PASSPORT_2:
            return classificator.Position.PASSPORT_RIGHT
        elif state == State.SHOW_PASSPORT_3:
            return classificator.Position.PASSPORT_LEFT

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

    def next_random_hand(self):
        new_state = random.choice(State.HANDS)
        while new_state == self.state:
            new_state = random.choice(State.HANDS)
        return new_state

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
