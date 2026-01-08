export const NODE_COLORS = [
    "#FF5733", // Red-Orange
    "#33FF57", // Green
    "#3357FF", // Blue
    "#F333FF", // Magenta
    "#33FFF5", // Cyan
    "#F5FF33", // Yellow
    "#FF8C33", // Orange
    "#8C33FF", // Purple
    "#33FF8C", // Spring Green
    "#FF3333", // Red
    "#33A1FF", // Sky Blue
    "#FF33A1", // Pink
    "#A1FF33", // Lime
    "#33FFD1", // Turquoise
    "#D133FF", // Violet
    "#FFD133", // Gold
    "#3366FF", // Royal Blue
    "#66FF33", // Bright Green
    "#FF3366", // Rose
    "#33FFFF", // Aqua
    "#FF9933", // Pumpkin
    "#9933FF", // Amethyst
    "#33FF99", // Seafoam
    "#FF3399", // Hot Pink
    "#0066FF", // Azure
    "#00FF66", // Malachite
    "#FF0066", // Crimson
    "#6600FF", // Indigo
    "#66FF00", // Chartreuse
    "#FF6600", // Blaze Orange
]

export function getNextColor(index: number): string {
    return NODE_COLORS[index % NODE_COLORS.length]
}
