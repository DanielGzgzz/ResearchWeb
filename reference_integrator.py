import numpy as np

def simulate_deterministic_orbit(n, l, m, num_steps=100000, dt=0.05):
    """
    Simulates a true deterministic trajectory using Geon fluid-dynamic forces.
    Weaves a 3D path over time instead of random sampling.
    """
    # 1. Geon Constants for this specific harmonic
    a0 = 1.0
    r0 = n**2 * a0  # Baseline equilibrium radius
    K_vac = 1.0     # Vacuum crush constant
    E_n = K_vac / r0 # Outward wave momentum

    # 2. Initial State (Start slightly off-center to trigger oscillation)
    r = r0 * 0.9
    theta = np.pi / 4.0 if l > 0 else np.pi / 2.0
    phi = 0.0

    vr, vtheta, vphi = 0.0, 0.1, 0.1 # Initial velocities

    # Pre-allocate arrays for speed
    samples_x = np.zeros(num_steps)
    samples_y = np.zeros(num_steps)
    samples_z = np.zeros(num_steps)

    # 3. The Path Integration Loop
    for i in range(num_steps):
        # A. Calculate Geon Forces
        # Outward centrifugal (E/r) vs Inward Casimir (K/r^2)
        F_r = (E_n / r) - (K_vac / r**2)

        # Angular restoring forces (Creates the nodal planes for p, d, f orbitals)
        # This simulates the transverse pressure of the vacuum fluid
        F_theta = -0.1 * l * np.cos(theta) * np.sin(theta)
        F_phi = 0.05 * m

        # B. Euler Integration (Update Velocities)
        vr += F_r * dt
        vtheta += F_theta * dt
        vphi += F_phi * dt

        # Vacuum kinematic damping (prevents explosive runaway)
        vr *= 0.999
        vtheta *= 0.999

        # C. Update Positions
        r += vr * dt
        theta += vtheta * dt
        phi += vphi * dt

        # D. Convert to Cartesian and Store
        samples_x[i] = r * np.sin(theta) * np.cos(phi)
        samples_y[i] = r * np.sin(theta) * np.sin(phi)
        samples_z[i] = r * np.cos(theta)

    # Return as r, theta, phi to match your plotting function's expected inputs
    # Alternatively, update your plotting function to directly accept x, y, z
    r_out = np.sqrt(samples_x**2 + samples_y**2 + samples_z**2)
    theta_out = np.arccos(samples_z / (r_out + 1e-10))
    phi_out = np.arctan2(samples_y, samples_x)

    return r_out, theta_out, phi_out