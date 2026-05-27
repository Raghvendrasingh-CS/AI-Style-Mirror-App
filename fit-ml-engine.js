/**
 * ============================================================
 * MYNTRA AI STYLE MIRROR — fit-ml-engine.js
 * ============================================================
 * Self-contained ML Fit Prediction Engine.
 * Architecture: Heuristic-supervised Random Forest Regressor
 *
 * HOW IT WORKS:
 *  1. featureExtractor()   → converts body+garment to 6 ML features
 *  2. calculateHeuristic() → physics-based tightness score
 *  3. RandomForestRegressor trained on 500 synthetic samples
 *     (supervised by heuristic — no external training data needed)
 *  4. predictFit()         → hybrid blend of ML + heuristic
 *  5. Output: fit_percentage (0-100), fit_label, tightness_score
 * ============================================================
 */

/* ────────────────────────────────────────────────────────────
   SEEDED RANDOM GENERATOR FOR DETERMINISTIC TRAINING
──────────────────────────────────────────────────────────── */
let currentSeed = 1;
function seededRandom() {
  const x = Math.sin(currentSeed++) * 10000;
  return x - Math.floor(x);
}

/* ────────────────────────────────────────────────────────────
   DECISION TREE REGRESSOR
──────────────────────────────────────────────────────────── */
class TreeNode {
  constructor(feature = null, threshold = null, left = null, right = null, value = null) {
    this.feature = feature;
    this.threshold = threshold;
    this.left = left;
    this.right = right;
    this.value = value;
  }
}

class DecisionTreeRegressor {
  constructor(maxDepth = 6, minSamplesSplit = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
    this.root = null;
  }

  fit(X, y) {
    this.root = this._buildTree(X, y, 0);
  }

  _buildTree(X, y, depth) {
    const n = X.length;
    if (n === 0) return null;
    if (depth >= this.maxDepth || n < this.minSamplesSplit || this._variance(y) < 1e-4) {
      return new TreeNode(null, null, null, null, this._mean(y));
    }

    const numFeatures = X[0].length;
    let bestFeature = null, bestThreshold = null, bestVR = -1;
    let bestLeft = null, bestRight = null;
    const curVar = this._variance(y);

    for (let f = 0; f < numFeatures; f++) {
      const vals = [...new Set(X.map(r => r[f]))].sort((a, b) => a - b);
      for (let i = 0; i < vals.length - 1; i++) {
        const threshold = (vals[i] + vals[i + 1]) / 2;
        const leftIdx = [], rightIdx = [];
        for (let k = 0; k < n; k++) {
          (X[k][f] <= threshold ? leftIdx : rightIdx).push(k);
        }
        if (!leftIdx.length || !rightIdx.length) continue;
        const wl = leftIdx.length / n, wr = rightIdx.length / n;
        const vr = curVar - wl * this._variance(leftIdx.map(i => y[i])) - wr * this._variance(rightIdx.map(i => y[i]));
        if (vr > bestVR) { bestVR = vr; bestFeature = f; bestThreshold = threshold; bestLeft = leftIdx; bestRight = rightIdx; }
      }
    }

    if (bestVR <= 0) return new TreeNode(null, null, null, null, this._mean(y));

    return new TreeNode(
      bestFeature, bestThreshold,
      this._buildTree(bestLeft.map(i => X[i]), bestLeft.map(i => y[i]), depth + 1),
      this._buildTree(bestRight.map(i => X[i]), bestRight.map(i => y[i]), depth + 1),
      null
    );
  }

  predictRow(node, row) {
    if (!node || node.value !== null) return node ? node.value : 0;
    return row[node.feature] <= node.threshold
      ? this.predictRow(node.left, row)
      : this.predictRow(node.right, row);
  }

  _mean(arr) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0; }
  _variance(arr) {
    if (!arr.length) return 0;
    const avg = this._mean(arr);
    return arr.reduce((s, v) => s + (v - avg) ** 2, 0) / arr.length;
  }
}

/* ────────────────────────────────────────────────────────────
   RANDOM FOREST REGRESSOR
──────────────────────────────────────────────────────────── */
class RandomForestRegressor {
  constructor(numTrees = 10, maxDepth = 7) {
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
    this.trees = [];
  }

  fit(X, y) {
    this.trees = [];
    for (let i = 0; i < this.numTrees; i++) {
      const Xs = [], ys = [];
      for (let j = 0; j < X.length; j++) {
        const idx = Math.floor(seededRandom() * X.length);
        Xs.push(X[idx]); ys.push(y[idx]);
      }
      const tree = new DecisionTreeRegressor(this.maxDepth);
      tree.fit(Xs, ys);
      this.trees.push(tree);
    }
  }

  predict(row) {
    const sum = this.trees.reduce((s, t) => s + t.predictRow(t.root, row), 0);
    return sum / this.trees.length;
  }
}

/* ────────────────────────────────────────────────────────────
   FEATURE EXTRACTOR
   Converts raw body + garment objects into a fixed-length
   numeric feature vector for the ML model.

   Features:
   [0] chest_diff      = garment.chest - body.chest
   [1] waist_diff      = garment.waist - body.waist
   [2] hip_diff        = garment.hip   - body.hip  (0 if missing)
   [3] fabric_stretch  = garment.fabric_stretch (0.0 – 0.5)
   [4] is_slim         = 1 if fit_type === 'slim'
   [5] is_regular      = 1 if fit_type === 'regular'
   [6] is_loose        = 1 if fit_type === 'loose'
──────────────────────────────────────────────────────────── */
function featureExtractor(body, garment) {
  const bodyHip = body.hip ?? body.hips ?? 0;
  const garmentHip = garment.hip ?? garment.hips ?? 0;

  // Calculate neutral hip ease to use as fallback if hip measurements are missing
  const fitType = garment.fit_type || 'regular';
  const idealEase = fitType === 'slim' ? 2 : fitType === 'loose' ? 6 : 3.5;

  let hipDiff;
  if (bodyHip > 0 && garmentHip > 0) {
    hipDiff = garmentHip - bodyHip;
  } else {
    hipDiff = idealEase; // Neutral fallback, matches ideal ease
  }

  return [
    (garment.chest ?? 0) - (body.chest ?? 0),
    (garment.waist ?? 0) - (body.waist ?? 0),
    hipDiff,
    garment.fabric_stretch ?? 0.1,
    garment.fit_type === 'slim' ? 1 : 0,
    garment.fit_type === 'regular' ? 1 : 0,
    garment.fit_type === 'loose' ? 1 : 0
  ];
}

/* ────────────────────────────────────────────────────────────
   HEURISTIC ENGINE
   Physics-based tightness calculation.
   Negative score = too tight; Positive = too loose.

   Ideal ease per fit type:
     slim    → +2cm  (snug, no extra room)
     regular → +3.5cm (standard comfort)
     loose   → +6cm  (relaxed drape)
──────────────────────────────────────────────────────────── */
function calculateHeuristic(body, garment) {
  const fitType = garment.fit_type || 'regular';
  const stretch = garment.fabric_stretch ?? 0.1;

  const idealEase = fitType === 'slim' ? 2 : fitType === 'loose' ? 6 : 3.5;

  const bodyChest = body.chest ?? null;
  const garmentChest = garment.chest ?? null;
  const bodyWaist = body.waist ?? null;
  const garmentWaist = garment.waist ?? null;
  const bodyHip = body.hip ?? body.hips ?? null;
  const garmentHip = garment.hip ?? garment.hips ?? null;

  const chestDev = (bodyChest !== null && garmentChest !== null && !isNaN(bodyChest) && !isNaN(garmentChest))
    ? (garmentChest - bodyChest) - idealEase
    : null;
  const waistDev = (bodyWaist !== null && garmentWaist !== null && !isNaN(bodyWaist) && !isNaN(garmentWaist))
    ? (garmentWaist - bodyWaist) - idealEase
    : null;
  const hipDev = (bodyHip !== null && garmentHip !== null && !isNaN(bodyHip) && !isNaN(garmentHip))
    ? (garmentHip - bodyHip) - idealEase
    : null;

  // Gather only valid deviations
  const devs = [chestDev, waistDev, hipDev].filter(v => v !== null && !isNaN(v));
  if (devs.length === 0) return 0; // default if no metrics are present

  const minDev = Math.min(...devs);
  const avgDev = devs.reduce((s, v) => s + v, 0) / devs.length;

  // If any dimension is tight, use the tightest
  const rawDev = minDev < 0 ? minDev : avgDev;

  // Fabric stretch reduces tightness (but not looseness)
  const score = rawDev < 0
    ? rawDev * (1 - stretch)   // fabric gives back some room when tight
    : rawDev;                  // looseness is unaffected by stretch

  return Math.round(score * 7.5);
}

/* ────────────────────────────────────────────────────────────
   SYNTHETIC DATASET GENERATION + MODEL TRAINING
   Runs once at startup. Generates 600 diverse body/garment
   pairs and labels them using the heuristic, then trains
   the Random Forest on this data.
──────────────────────────────────────────────────────────── */
const forest = new RandomForestRegressor(10, 7);

function initializeModel() {
  currentSeed = 1; // Reset seed for deterministic training
  const X = [], y = [];
  const fitTypes = ['slim', 'regular', 'loose'];

  for (let i = 0; i < 600; i++) {
    const bodyChest = 30 + seededRandom() * 25;
    const bodyWaist = 24 + seededRandom() * 22;
    const bodyHip = 32 + seededRandom() * 22;
    const fitType = fitTypes[Math.floor(seededRandom() * 3)];
    const stretch = seededRandom() * 0.45;

    // Garment has deviations -6 to +12 from body
    const garment = {
      chest: bodyChest + (-6 + seededRandom() * 18),
      waist: bodyWaist + (-6 + seededRandom() * 18),
      hip: bodyHip + (-6 + seededRandom() * 18),
      fit_type: fitType,
      fabric_stretch: stretch
    };

    const body = { chest: bodyChest, waist: bodyWaist, hip: bodyHip };
    const label = calculateHeuristic(body, garment);

    X.push(featureExtractor(body, garment));
    y.push(label);
  }

  forest.fit(X, y);
  console.log('✅ Fit ML model trained on 600 synthetic samples');
}

// Train on module load
initializeModel();

/* ────────────────────────────────────────────────────────────
   PREDICT FIT — Main exported function
   Input:  body { chest, waist, hip/hips, shoulder?, height? }
           garment { chest, waist, hip/hips?, fit_type, fabric_stretch, length? }
   Output: { fit_percentage, fit_label, tightness_score }
──────────────────────────────────────────────────────────── */
function predictFit(body, garment) {
  // Normalize hip keys
  body = { ...body, hips: body.hip ?? body.hips };
  garment = { ...garment, hips: garment.hip ?? garment.hips };

  const features = featureExtractor(body, garment);
  const mlScore = forest.predict(features);
  const heuristicScore = calculateHeuristic(body, garment);

  // Hybrid: trust heuristic when ML and heuristic agree closely
  let tightness_score;
  if (Math.abs(mlScore - heuristicScore) < 8) {
    tightness_score = heuristicScore;
  } else {
    // Weighted blend: 60% ML, 40% heuristic
    tightness_score = Math.round(mlScore * 0.6 + heuristicScore * 0.4);
  }

  // fit_percentage: 100 = perfect, decreases as score diverges from 0
  const fit_percentage = Math.max(0, Math.min(100, Math.round(100 - Math.abs(tightness_score))));

  // Label mapping
  let fit_label;
  if (tightness_score <= -15) fit_label = 'Too Tight';
  else if (tightness_score < -4) fit_label = 'Slightly Tight';
  else if (tightness_score <= 4) fit_label = 'Perfect Fit';
  else if (tightness_score < 15) fit_label = 'Slightly Loose';
  else fit_label = 'Too Loose';

  return { fit_percentage, fit_label, tightness_score };
}

/* ────────────────────────────────────────────────────────────
   RETRAIN WITH REAL DATA (call after collecting feedback)
   Pass an array of { body, garment, actual_tightness_score }
──────────────────────────────────────────────────────────── */
function retrainWithFeedback(feedbackRecords) {
  currentSeed = 1; // Reset seed for deterministic retraining
  const X = [], y = [];

  // Start with fresh synthetic data
  const fitTypes = ['slim', 'regular', 'loose'];
  for (let i = 0; i < 400; i++) {
    const bc = 30 + seededRandom() * 25, bw = 24 + seededRandom() * 22, bh = 32 + seededRandom() * 22;
    const ft = fitTypes[Math.floor(seededRandom() * 3)], st = seededRandom() * 0.45;
    const g = { chest: bc + (-6 + seededRandom() * 18), waist: bw + (-6 + seededRandom() * 18), hip: bh + (-6 + seededRandom() * 18), fit_type: ft, fabric_stretch: st };
    const b = { chest: bc, waist: bw, hip: bh };
    X.push(featureExtractor(b, g)); y.push(calculateHeuristic(b, g));
  }

  // Add real feedback (weighted 2x)
  feedbackRecords.forEach(r => {
    const f = featureExtractor(r.body, r.garment);
    X.push(f, f); // double weight
    y.push(r.actual_tightness_score, r.actual_tightness_score);
  });

  forest.fit(X, y);
  console.log(`✅ Model retrained with ${feedbackRecords.length} real feedback records`);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { predictFit, calculateHeuristic, retrainWithFeedback };
} else {
  window.FitMLEngine = { predictFit, calculateHeuristic, retrainWithFeedback };
}