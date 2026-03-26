import React, { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const SetupAuth = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const handDetectorRef = useRef(null);
  const [capturedGesture, setCapturedGesture] = useState(null);
  const [samplesCollected, setSamplesCollected] = useState(0);
  const [status, setStatus] = useState("Capture gesture sample 1 of 3");

  useEffect(() => {
    // slight delay to avoid WASM crash
    const timer = setTimeout(() => {
      startCamera();
    }, 500);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      videoRef.current.srcObject = stream;

      // wait until video is ready
      videoRef.current.onloadedmetadata = () => {
        initHands();
      };
    } catch (err) {
      console.log("Camera error:", err);
      alert("Camera permission denied");
    }
  };

  const initHands = () => {
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
        const gesture = landmarks.map((p) => [p.x, p.y, p.z]);
        setCapturedGesture(gesture);

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
        if (!videoRef.current) return;
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

  const saveGesture = async () => {
    if (!capturedGesture) {
      alert("Please show your hand first");
      return;
    }

    const stored = localStorage.getItem("vsu_reg");
    const registrant = stored ? JSON.parse(stored) : null;

    if (!registrant?.email || !registrant?.name || !registrant?.password) {
      alert("Please complete registration first.");
      return;
    }

    try {
      setStatus("Processing gesture...");
      
      // First sample uses register-with-gesture endpoint
      if (samplesCollected === 0) {
        const res = await fetch("http://localhost:5001/api/auth/register-with-gesture", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: registrant.name,
            email: registrant.email,
            password: registrant.password,
            gesture: capturedGesture,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to save gesture");
        }

        setSamplesCollected(1);
        setStatus("Gesture 1/3 captured ✓ - Now capture sample 2");
        setCapturedGesture(null);
        return;
      }

      // Additional samples use save-gesture endpoint
      const res = await fetch("http://localhost:5001/api/auth/save-gesture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registrant.email,
          gesture: capturedGesture,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save gesture");
      }

      const newCount = data.samplesCollected || samplesCollected + 1;
      setSamplesCollected(newCount);

      if (newCount >= 3) {
        setStatus("All 3 samples captured! ✓✓✓");
        stopCamera();
        setTimeout(() => {
          localStorage.removeItem("vsu_reg");
          localStorage.setItem("email", registrant.email);
          alert("Gesture setup complete with 3 samples. You can now log in.");
          window.location.href = "/login";
        }, 500);
      } else {
        setStatus(`Gesture ${newCount}/3 captured ✓ - Now capture sample ${newCount + 1}`);
        setCapturedGesture(null);
      }
    } catch (err) {
      console.log(err);
      setStatus("Error: " + err.message);
    }
  };

  const buttonText = samplesCollected === 0 
    ? "Save Gesture 1"
    : samplesCollected === 1
    ? "Save Gesture 2"
    : "Save Gesture 3";

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl mb-2">Setup Hand Gesture (MFA)</h1>
      <p className="text-lg mb-6 text-green-400 font-semibold">{status}</p>

      <div className="relative mb-6">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-[420px] rounded-lg border border-gray-500"
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          className="absolute top-0 left-0 w-[420px] h-[315px] rounded-lg pointer-events-none"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={saveGesture}
          disabled={!capturedGesture}
          className="px-8 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {buttonText}
        </button>
      </div>

      <div className="mt-6 flex gap-2">
        <div className={`w-4 h-4 rounded-full ${samplesCollected >= 1 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
        <div className={`w-4 h-4 rounded-full ${samplesCollected >= 2 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
        <div className={`w-4 h-4 rounded-full ${samplesCollected >= 3 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
      </div>
    </div>
  );
};

export default SetupAuth;