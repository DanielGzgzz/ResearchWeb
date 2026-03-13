function computeBishopFrames(curve, segments, closed) {
    const points = curve.getSpacedPoints(segments);
    const tangents = [];
    const normals = [];
    const binormals = [];

    // Initialize the tangents
    for (let i = 0; i <= segments; i++) {
        let tangent = new THREE.Vector3();
        if (i === segments && closed) {
            tangent.copy(tangents[0]);
        } else if (i === segments && !closed) {
            tangent.subVectors(points[i], points[i - 1]).normalize();
        } else if (i === 0 && !closed) {
            tangent.subVectors(points[1], points[0]).normalize();
        } else if (i === 0 && closed) {
            tangent.subVectors(points[1], points[segments - 1]).normalize();
        } else {
            tangent.subVectors(points[i + 1], points[i - 1]).normalize();
        }
        tangents.push(tangent);
    }

    // Initialize the first normal and binormal
    let initialNormal = new THREE.Vector3();
    let tx = Math.abs(tangents[0].x);
    let ty = Math.abs(tangents[0].y);
    let tz = Math.abs(tangents[0].z);

    let min = Math.min(tx, ty, tz);
    if (min === tx) {
        initialNormal.set(1, 0, 0);
    } else if (min === ty) {
        initialNormal.set(0, 1, 0);
    } else {
        initialNormal.set(0, 0, 1);
    }

    let vec = new THREE.Vector3().crossVectors(tangents[0], initialNormal).normalize();
    initialNormal.crossVectors(tangents[0], vec).normalize();

    normals.push(initialNormal);
    let initialBinormal = new THREE.Vector3().crossVectors(tangents[0], initialNormal).normalize();
    binormals.push(initialBinormal);

    // Compute parallel transport (Bishop) frames
    for (let i = 1; i <= segments; i++) {
        let prevNormal = normals[i - 1];
        let prevTangent = tangents[i - 1];
        let currentTangent = tangents[i];

        // Axis of rotation from prevTangent to currentTangent
        let axis = new THREE.Vector3().crossVectors(prevTangent, currentTangent);
        let angle = Math.acos(THREE.MathUtils.clamp(prevTangent.dot(currentTangent), -1, 1));

        let currentNormal = prevNormal.clone();
        if (axis.length() > 1e-6) {
            axis.normalize();
            currentNormal.applyAxisAngle(axis, angle);
        }

        normals.push(currentNormal);

        let currentBinormal = new THREE.Vector3().crossVectors(currentTangent, currentNormal).normalize();
        binormals.push(currentBinormal);
    }

    // Optional: If closed, distribute the twist so it matches perfectly
    if (closed) {
        let theta = Math.acos(THREE.MathUtils.clamp(normals[0].dot(normals[segments]), -1, 1));
        theta /= segments;

        if (tangents[0].dot(new THREE.Vector3().crossVectors(normals[0], normals[segments])) > 0) {
            theta = -theta;
        }

        for (let i = 1; i <= segments; i++) {
            normals[i].applyAxisAngle(tangents[i], theta * i);
            binormals[i].crossVectors(tangents[i], normals[i]).normalize();
        }
    }

    return { tangents, normals, binormals };
}
