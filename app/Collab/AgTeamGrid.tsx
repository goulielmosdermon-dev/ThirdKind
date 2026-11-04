const sources = [
  {
    src: '/Collab/references/ag-design/Screenshot%202026-11-03%20at%201.22.07%E2%80%AFPM.png',
    width: 3056,
    height: 1892,
    columns: [27, 1037, 2047],
    rows: [33, 658, 1281],
    people: [
      [0, 0],
      [0, 1],
      [1, 2],
      [2, 0],
      [2, 1],
      [2, 2],
    ],
  },
  {
    src: '/Collab/references/ag-design/Screenshot%202026-11-03%20at%201.22.18%E2%80%AFPM.png',
    width: 3060,
    height: 1896,
    columns: [33, 1043, 2053],
    rows: [30, 653, 1277],
    people: [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 0],
      [2, 1],
    ],
  },
];

export function AgTeamGrid() {
  return (
    <section className="collab-team-grid" aria-label="AG Design team portraits">
      {sources.flatMap((source, sourceIndex) =>
        source.people.map(([row, column], index) => (
          <figure key={`${sourceIndex}-${row}-${column}`}>
            <svg
              viewBox={`${source.columns[column!]! + 5} ${source.rows[row!]! + 5} 962 575`}
              role="img"
              aria-label={`AG Design video-call portrait ${sourceIndex * 6 + index + 1}`}
            >
              <image
                href={source.src}
                width={source.width}
                height={source.height}
              />
            </svg>
          </figure>
        )),
      )}
    </section>
  );
}
