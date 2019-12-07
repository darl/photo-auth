
import cv2
from av import VideoFrame
from aiortc import MediaStreamTrack


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
        self.session.last_frame = frame
        try:
            self.color = (0, 255, 0) if self.session.res else (0, 0, 255)

            img = frame.to_ndarray(format="bgr24")

            if self.session.bounds:
                left, top, right, bottom = self.session.bounds
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
