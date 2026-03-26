import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const VerifyAuth = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const handDetectorRef = useRef(null);
  const [capturedGesture, setCapturedGesture] = useState(null);
  const [status, setStatus] = useState("Please show your hand gesture");
  const navigate = useNavigate();

  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    handDetectorRef.current = null;
  };

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          const hands = new Hands({
            locateFile: (file) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`,
          });

          hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
            selfieMode: true,
          });

          hands.onResults((results) => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            if (results.multiHandLandmarks?.length > 0) {
              const landmarks = results.multiHandLandmarks[0];
              setCapturedGesture(landmarks.map((p) => [p.x, p.y, p.z]));

              // Draw neural dots (landmarks)
              if (ctx) {
                ctx.fillStyle = "#00ff00"; // Green dots
                landmarks.forEach((landmark) => {
                  const x = landmark.x * canvas.width;
                  const y = landmark.y * canvas.height;
                  ctx.beginPath();
                  ctx.arc(x, y, 4, 0, 2 * Math.PI); // 4px radius dots
                  ctx.fill();
                });

                // Draw connections to show gesture shape
                ctx.strokeStyle = "#00ff00";
                ctx.lineWidth = 2;
                
                // Draw hand connections (simplified)
                const connections = [
                  [0,1],[1,2],[2,3],[3,4], // thumb
                  [0,5],[5,6],[6,7],[7,8], // index
                  [0,9],[9,10],[10,11],[11,12], // middle
                  [0,13],[13,14],[14,15],[15,16], // ring
                  [0,17],[17,18],[18,19],[19,20], // pinky
                  [5,9],[9,13],[13,17] // palm
                ];
                
                connections.forEach(([i,j]) => {
                  const p1 = landmarks[i];
                  const p2 = landmarks[j];
                  ctx.beginPath();
                  ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
                  ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
                  ctx.stroke();
                });
              }
            }
          });

          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              try {
                await hands.send({ image: videoRef.current });
              } catch (err) {
                console.warn("hands.send error", err);
              }
            },
            width: 640,
            height: 480,
          });

          cameraRef.current = camera;
          handDetectorRef.current = hands;
          camera.start();
        };
      } catch (err) {
        console.error(err);
        setStatus("Camera access denied");
      }
    };

    init();

    return () => {
      stopCamera();
    };
  }, []);

  const submitGesture = async () => {
    if (!capturedGesture) {
      alert("Show your gesture first");
      return;
    }

    const email = localStorage.getItem("email");
    if (!email) {
      alert("Email missing, login again");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/auth/verify-gesture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, gesture: capturedGesture }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus(`Verification failed: ${data.message}`);
        return;
      }

      setStatus("Gesture verified, login success");
      stopCamera();
      alert("Login successful via gesture");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setStatus("Verification error");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-2xl mb-4">Verify Hand Gesture</h1>
      <p>{status}</p>
      <div className="relative mb-4">
        <video ref={videoRef} autoPlay playsInline className="w-[420px] rounded-lg border border-gray-500" />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          className="absolute top-0 left-0 w-[420px] h-[315px] rounded-lg pointer-events-none"
        />
      </div>
      <button onClick={submitGesture} className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition">
        Submit Gesture
      </button>
    </div>
  );
};

export default VerifyAuth;
