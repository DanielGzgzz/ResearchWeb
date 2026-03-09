import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import matplotlib.colors as mcolors

def generate_tube(gamma, num_sides=4, radius=0.2, twists=0):
    num_points = len(gamma)
    dgamma = np.gradient(gamma, axis=0)
    T = dgamma / np.linalg.norm(dgamma, axis=1)[:, np.newaxis]

    # Parallel transport frame
    N = np.zeros_like(gamma)
    B = np.zeros_like(gamma)

    v = np.array([0.0, 0.0, 1.0])
    if np.abs(np.dot(T[0], v)) > 0.9:
        v = np.array([0.0, 1.0, 0.0])

    n0 = v - np.dot(T[0], v) * T[0]
    n0 /= np.linalg.norm(n0)
    b0 = np.cross(T[0], n0)

    N[0] = n0
    B[0] = b0

    for i in range(1, num_points):
        v1 = T[i-1]
        v2 = T[i]

        axis = np.cross(v1, v2)
        sin_angle = np.linalg.norm(axis)
        cos_angle = np.dot(v1, v2)

        if sin_angle > 1e-6:
            axis /= sin_angle
            angle = np.arctan2(sin_angle, cos_angle)

            K = np.array([
                [0, -axis[2], axis[1]],
                [axis[2], 0, -axis[0]],
                [-axis[1], axis[0], 0]
            ])
            R_mat = np.eye(3) + np.sin(angle) * K + (1 - np.cos(angle)) * np.dot(K, K)

            N[i] = np.dot(R_mat, N[i-1])
            B[i] = np.dot(R_mat, B[i-1])
        else:
            N[i] = N[i-1]
            B[i] = B[i-1]

    # Closure mismatch
    v1 = T[-1]
    v2 = T[0]
    axis = np.cross(v1, v2)
    sin_angle = np.linalg.norm(axis)
    cos_angle = np.dot(v1, v2)

    N_end = N[-1]
    if sin_angle > 1e-6:
        axis /= sin_angle
        angle = np.arctan2(sin_angle, cos_angle)
        K = np.array([
            [0, -axis[2], axis[1]],
            [axis[2], 0, -axis[0]],
            [-axis[1], axis[0], 0]
        ])
        R_mat = np.eye(3) + np.sin(angle) * K + (1 - np.cos(angle)) * np.dot(K, K)
        N_end = np.dot(R_mat, N[-1])

    dot_prod = np.clip(np.dot(N_end, N[0]), -1.0, 1.0)
    det = np.dot(T[0], np.cross(N_end, N[0]))
    mismatch_angle = np.arctan2(det, dot_prod)

    total_twist = twists * 2 * np.pi - mismatch_angle

    for i in range(num_points):
        theta = total_twist * i / (num_points - 1)
        cos_t = np.cos(theta)
        sin_t = np.sin(theta)
        n_rot = N[i] * cos_t + B[i] * sin_t
        b_rot = -N[i] * sin_t + B[i] * cos_t
        N[i] = n_rot
        B[i] = b_rot

    angles = np.linspace(0, 2*np.pi, num_sides, endpoint=False)
    angles += np.pi / 4 # Offset for square

    vertices = []
    faces = []
    face_indices = []

    for i in range(num_points):
        for j in range(num_sides):
            angle = angles[j]
            pt = gamma[i] + radius * (np.cos(angle) * N[i] + np.sin(angle) * B[i])
            vertices.append(pt)

    vertices = np.array(vertices)

    for i in range(num_points - 1):
        for j in range(num_sides):
            j_next = (j + 1) % num_sides
            v0 = i * num_sides + j
            v1 = i * num_sides + j_next
            v2 = (i + 1) * num_sides + j_next
            v3 = (i + 1) * num_sides + j
            faces.append([v0, v1, v2, v3])
            face_indices.append(i)

    for j in range(num_sides):
        j_next = (j + 1) % num_sides
        v0 = (num_points - 1) * num_sides + j
        v1 = (num_points - 1) * num_sides + j_next
        v2 = j_next
        v3 = j
        faces.append([v0, v1, v2, v3])
        face_indices.append(num_points - 1)

    return vertices, faces, face_indices

def get_electron_colors(face_indices, num_points):
    colors = np.zeros((len(face_indices), 4))
    for idx, i in enumerate(face_indices):
        t = i / float(num_points)
        # Gradient from blue to purple
        # using a combination of sine waves to make a smooth loop
        r = 0.5 + 0.4 * np.sin(t * 2 * np.pi)
        g = 0.1
        b = 0.8 + 0.2 * np.cos(t * 2 * np.pi)
        colors[idx] = (r, g, b, 1.0)
    return colors

def get_proton_colors(face_indices, num_points):
    colors = np.zeros((len(face_indices), 4))
    for idx, i in enumerate(face_indices):
        t = i / float(num_points)
        t_adj = (t + 0.166) % 1.0
        if t_adj < 0.333:
            # Lobe 1: Red/Orange
            c = plt.cm.autumn(t_adj / 0.333)
        elif t_adj < 0.666:
            # Lobe 2: Grey
            val = 0.4 + 0.3 * np.sin((t_adj - 0.333) / 0.333 * np.pi)
            c = (val, val, val, 1.0)
        else:
            # Lobe 3: Yellow/Orange
            c = plt.cm.Wistia((t_adj - 0.666) / 0.333)
        colors[idx] = c
    return colors

def get_neutron_colors(face_indices, num_points):
    colors = np.zeros((len(face_indices), 4))
    for idx, i in enumerate(face_indices):
        t = i / float(num_points)
        t_adj = (t + 0.166) % 1.0
        if t_adj < 0.333:
            # Lobe 1: Light Green
            c = plt.cm.summer(0.5 + 0.5 * (t_adj / 0.333))
        elif t_adj < 0.666:
            # Lobe 2: Dark Blue
            c = plt.cm.viridis((t_adj - 0.333) / 0.333 * 0.4)
        else:
            # Lobe 3: Dark Green/Teal
            c = plt.cm.viridis(0.3 + 0.4 * (t_adj - 0.666) / 0.333)
        colors[idx] = c
    return colors

def draw_particle(ax, vertices, faces, colors, view):
    collection = Poly3DCollection([vertices[f] for f in faces], facecolors=colors, edgecolors='black', linewidths=0.2, alpha=1.0)
    ax.add_collection3d(collection)

    all_v = np.vstack(vertices)
    max_range = np.array([all_v[:,0].max()-all_v[:,0].min(), all_v[:,1].max()-all_v[:,1].min(), all_v[:,2].max()-all_v[:,2].min()]).max() / 2.0
    mid_x = (all_v[:,0].max()+all_v[:,0].min()) * 0.5
    mid_y = (all_v[:,1].max()+all_v[:,1].min()) * 0.5
    mid_z = (all_v[:,2].max()+all_v[:,2].min()) * 0.5

    ax.set_xlim(mid_x - max_range, mid_x + max_range)
    ax.set_ylim(mid_y - max_range, mid_y + max_range)
    ax.set_zlim(mid_z - max_range, mid_z + max_range)

    ax.set_axis_off()

    if view == 'top':
        ax.view_init(elev=90, azim=-90)
    elif view == 'iso':
        ax.view_init(elev=30, azim=-45)
    elif view == 'side':
        ax.view_init(elev=0, azim=-90)

def main():
    fig = plt.figure(figsize=(12, 12))

    # 1. Electron
    t_e = np.linspace(0, 2*np.pi, 400)
    R_e = 1.0
    gamma_e = np.column_stack((R_e*np.cos(t_e), R_e*np.sin(t_e), np.zeros_like(t_e)))
    v_e, f_e, ind_e = generate_tube(gamma_e, num_sides=4, radius=0.18, twists=2)
    c_e = get_electron_colors(ind_e, len(t_e))

    # 2. Proton
    t_p = np.linspace(0, 2*np.pi, 400)
    R_p = 0.8
    r_p = 0.4
    x_p = (R_p + r_p * np.cos(3*t_p)) * np.cos(2*t_p)
    y_p = (R_p + r_p * np.cos(3*t_p)) * np.sin(2*t_p)
    z_p = r_p * np.sin(3*t_p)
    gamma_p = np.column_stack((x_p, y_p, z_p))
    v_p, f_p, ind_p = generate_tube(gamma_p, num_sides=4, radius=0.15, twists=0) # Removing manual twist to preserve orthogonal framing naturally
    c_p = get_proton_colors(ind_p, len(t_p))

    # 3. Neutron
    v_n, f_n, ind_n = generate_tube(gamma_p, num_sides=4, radius=0.15, twists=0)
    c_n = get_neutron_colors(ind_n, len(t_p))

    particles = [
        (v_e, f_e, c_e, 'Electron ($e^-$)'),
        (v_p, f_p, c_p, 'Proton ($p^+$)'),
        (v_n, f_n, c_n, 'Neutron ($n^0$)')
    ]
    views = [('top', 'Top View'), ('iso', 'Isometric View'), ('side', 'Side Profile')]

    for row, (v, f, c, label) in enumerate(particles):
        for col, (view, view_label) in enumerate(views):
            ax = fig.add_subplot(3, 3, row*3 + col + 1, projection='3d')
            draw_particle(ax, v, f, c, view)
            if row == 0:
                ax.set_title(view_label, fontsize=14, fontweight='bold', pad=20)
            if col == 0:
                # Add text label to the left of the row
                ax.text2D(-0.2, 0.5, label, transform=ax.transAxes, fontsize=14, fontweight='bold', rotation=90, va='center', ha='center')

    plt.tight_layout()
    plt.subplots_adjust(left=0.15, top=0.9)
    plt.savefig('geon_framework.png', dpi=300, bbox_inches='tight')
    print("Saved geon_framework.png")

if __name__ == '__main__':
    main()
