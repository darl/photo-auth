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

    def __init__(self, track, transform):
        super().__init__()  # don't forget this!
        self.track = track
        self.transform = transform
        self.cd = time.time()
        self.last_frame = None
        self.bounds = (0, 0, 1, 1)

    async def update_state(self, frame):
        res, bounds = classificator.predict(frame, classificator.Position.HAND_TOP_LEFT)
        self.bounds = bounds
        if res:
            self.transform = ""
        else:
            self.transform = "edges"

    async def recv(self):
        frame = await self.track.recv()
        self.last_frame = frame

        if time.time() - self.cd > 1:
            asyncio.create_task(self.update_state(frame))
            self.cd = time.time()

        elif self.transform == "edges":
            # perform edge detection
            img = frame.to_ndarray(format="bgr24")
            img = cv2.cvtColor(cv2.Canny(img, 100, 200), cv2.COLOR_GRAY2BGR)

            left, top, right, bottom = self.bounds
            img = cv2.rectangle(img, (left, top), (right, bottom), (255, 0, 0), 2)

            # rebuild a VideoFrame, preserving timing information
            new_frame = VideoFrame.from_ndarray(img, format="bgr24")
            new_frame.pts = frame.pts
            new_frame.time_base = frame.time_base
            return new_frame
        else:
            return frame
