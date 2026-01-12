export const NODE_COLORS = [
    "#ABA482",
    "#910043",
    "#D50202",
    "#E0007B",
    "#F770A6",
    "#00CFD1",
    "#0078DB",
    "#4C00F0",
    "#9600DB",
    "#B175F6",
    "#00DB84",
    "#9DFA8F",
    "#20A55B",
    "#8DD100",
    "#D9D200",
    "#F05000",
    "#FB790E",
    "#E6AC00",
]

export function getNextColor(index: number): string {
    return NODE_COLORS[index % NODE_COLORS.length]
}
