import time

import cv2
from av import VideoFrame
from aiortc import MediaStreamTrack
import asyncio

import classificator


class VideoTransformTrack(MediaStreamTrack):
    """
    A video stream track that transforms frames from an another track.
    """

    kind = "video"

    def __init__(self, track):
        super().__init__()  # don't forget this!
        self.track = track
        self.color = None
        self.cd = time.time()
        self.last_frame = None
        self.bounds = None

    async def update_state(self, frame):
        res, bounds = classificator.predict(frame, classificator.Position.PASSPORT_RIGHT)
        self.bounds = bounds
        if res:
            self.color = (0, 255, 0)
        else:
            self.color = (0, 0, 255)

    async def recv(self):
        frame = await self.track.recv()
        try:
            self.last_frame = frame

            if time.time() - self.cd > 0.6:
                asyncio.create_task(self.update_state(frame))
                self.cd = time.time()

            img = frame.to_ndarray(format="bgr24")

            if self.bounds:
                left, top, right, bottom = self.bounds
                img = cv2.rectangle(img, (left, top), (right, bottom), self.color, 1)

            # rebuild a VideoFrame, preserving timing information
            new_frame = VideoFrame.from_ndarray(img, format="bgr24")
            new_frame.pts = frame.pts
            new_frame.time_base = frame.time_base
            return new_frame
        except Exception as err:
            print("Error in video transformer")
            print(err)
            return frame
