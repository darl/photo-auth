import logging

import cv2
from aiortc import MediaStreamTrack
from av import VideoFrame

import classificator

logger = logging.getLogger("transformer")


class VideoTransformTrack(MediaStreamTrack):
    """
    A video stream track that transforms frames from an another track.
    """

    kind = "video"

    def __init__(self, track, session):
        super().__init__()  # don't forget this!
        self.session = session
        self.track = track
        self.color = None
        self.bounds = None

    async def recv(self):
        frame = await self.track.recv()
        self.session.last_image = frame.to_image()
        try:
            self.color = (0, 255, 0) if self.session.success_predict_count > 0 else (0, 0, 255)  # red or green

            img = frame.to_ndarray(format="bgr24")

            # show current active zone
            if self.session.bounds:
                left, top, right, bottom = self.session.bounds
                img = cv2.rectangle(img, (left, top), (right, bottom), self.color, 1)

            # rebuild a VideoFrame, preserving timing information
            new_frame = VideoFrame.from_ndarray(img, format="bgr24")
            new_frame.pts = frame.pts
            new_frame.time_base = frame.time_base
            return new_frame
        except Exception:
            logger.exception("Error in video transformer")
            return frame
