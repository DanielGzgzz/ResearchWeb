# Deterministic Physics of the Geon Fluid-Dynamic Orbit

The Geon framework rejects standard quantum mechanical probability clouds (Monte Carlo rejection sampling) in favor of a true deterministic trajectory driven by fluid-dynamic forces.

Instead of asking "where is the particle likely to be?", we calculate exactly where a single, continuous track is moving at every time step $dt$ based on opposing fluid forces (Casimir Vacuum Pressure vs. Centrifugal Wave Momentum). Over time, this single continuous path weaves a dense, Lissajous-like shape that accurately reproduces the time-averaged quantum cloud.

## Force Equations

To weave a 3D shape (like a $p$-orbital) from a single path, the Geon's radial equilibrium ($F_r$) is coupled with angular forces ($F_\theta, F_\phi$) dictated by the orbital angular momentum ($l$) and magnetic quantum number ($m$).

### 1. Radial Force ($F_r$)
The balance between outward centrifugal momentum and inward Casimir vacuum crush.
$$F_r = \frac{E_n}{r} - \frac{K_{vac}}{r^2}$$
*   $K_{vac}$ = Vacuum crush constant
*   $E_n = \frac{K_{vac}}{r_0}$ = Outward wave momentum (where $r_0$ is the baseline equilibrium radius, $n^2 \cdot a_0$)

### 2. Angular Restoring Forces ($F_\theta, F_\phi$)
The wave's velocity creates a transverse pressure gradient in the fluid, carving the nodal planes for specific orbitals (p, d, f).
*   $F_\theta = -0.1 \cdot l \cdot \cos(\theta) \cdot \sin(\theta)$
*   $F_\phi = 0.05 \cdot m$

### 3. Kinematic Damping
A vacuum kinematic damping factor (e.g., multiplying velocity by $0.999$) is applied at each step to represent the fluid viscosity and prevent explosive runaway.

### 4. Euler Integration
The standard kinematic update applied over time $dt$:
$$\mathbf{v}_{t+1} = \mathbf{v}_t + \mathbf{F}_{net} \cdot dt$$
$$\mathbf{p}_{t+1} = \mathbf{p}_t + \mathbf{v}_{t+1} \cdot dt$$

By dropping a point into this mathematical "bowl" created by the Casimir/Centrifugal equilibrium, the point continuously orbits, overshoots, and falls back. Over thousands of frames, this continuous string weaves a dense 3D volume.
