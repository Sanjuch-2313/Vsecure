import User from "../models/User.js";
import bcrypt from "bcrypt";

const gestureDistance = (template, sample) => {
  if (!Array.isArray(template) || !Array.isArray(sample) || template.length !== sample.length) {
    return Infinity;
  }

  let sum = 0;
  for (let i = 0; i < template.length; i++) {
    const [x1, y1, z1] = template[i];
    const [x2, y2, z2] = sample[i];
    const dx = x1 - x2;
    const dy = y1 - y2;
    const dz = z1 - z2;
    sum += dx * dx + dy * dy + dz * dz;
  }

  return Math.sqrt(sum / template.length);
};

// Find best match distance against multiple stored gesture samples
const findBestGestureMatch = (storedGestures, sampleGesture) => {
  if (!Array.isArray(storedGestures) || storedGestures.length === 0) {
    return Infinity;
  }

  let bestDistance = Infinity;
  for (const storedGesture of storedGestures) {
    const dist = gestureDistance(storedGesture, sampleGesture);
    if (dist < bestDistance) {
      bestDistance = dist;
    }
  }
  return bestDistance;
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing registration fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerWithGesture = async (req, res) => {
  try {
    const { name, email, password, gesture } = req.body;
    if (!name || !email || !password || !gesture?.length) {
      return res.status(400).json({ message: "Missing fields or gesture" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Store gesture as an array of samples (first sample)
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      gesture: [gesture],  // Store as array of samples
      gestureEnabled: true 
    });
    await newUser.save();

    res.status(201).json({ message: "User registered with gesture" });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const saveGesture = async (req, res) => {
  try {
    const { email, gesture } = req.body;
    if (!email || !gesture?.length) {
      return res.status(400).json({ message: "Missing email or gesture" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add new gesture sample to array (max 3 samples for better matching)
    if (!Array.isArray(user.gesture)) {
      user.gesture = [];
    }
    if (user.gesture.length < 3) {
      user.gesture.push(gesture);
    }
    user.gestureEnabled = true;
    await user.save();

    const sampleCount = user.gesture.length;
    const confirmMessage = sampleCount < 3 
      ? `Gesture sample ${sampleCount} saved. You need ${3 - sampleCount} more samples.`
      : "All gesture samples saved successfully";

    res.json({ message: confirmMessage, samplesCollected: sampleCount });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If user has gesture enabled and gesture is stored, require verification (MFA)
    const needsGesture = user.gestureEnabled && user.gesture?.length > 0;
    res.json({ message: "Password verified", needsGesture });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyGesture = async (req, res) => {
  try {
    const { email, gesture } = req.body;
    if (!email || !gesture?.length) {
      return res.status(400).json({ message: "Missing email or gesture" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.gesture?.length) {
      return res.status(404).json({ message: "Gesture not set" });
    }

    // Find best match against all stored gesture samples
    const dist = findBestGestureMatch(user.gesture, gesture);
    
    // Strict threshold - 0.15 means avg deviation of only 0.15 per landmark
    const threshold = 0.15;
    if (dist > threshold) {
      return res.status(401).json({ 
        message: `Gesture mismatch. Distance: ${dist.toFixed(3)} (must be < ${threshold})`, 
        distance: dist 
      });
    }

    res.json({ 
      message: "Gesture verified successfully", 
      distance: dist.toFixed(3),
      confidence: ((1 - Math.min(dist / threshold, 1)) * 100).toFixed(1) + '%'
    });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};