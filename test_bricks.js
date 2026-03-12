function buildDiscreteSquareTube(curve, segments, radius, thicknessRatio) {
    const points = curve.getSpacedPoints(segments);
    const frames = curve.computeFrenetFrames(segments, true);

    // logic...
}
