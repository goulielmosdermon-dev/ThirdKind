function SideView({ second = false }: { second?: boolean }) {
  return (
    <svg
      viewBox="0 0 1280 1100"
      role="img"
      aria-label={
        second
          ? 'Small booth second side elevation'
          : 'Small booth side elevation'
      }
    >
      <g className="small-booth-panels">
        <path
          className="booth-fill booth-outline"
          pathLength="1"
          d="M90 66H1194V995H90ZM90 66H204V986H90Z"
        />
        <path
          className="booth-fill booth-outline"
          pathLength="1"
          d="M734 598H1186V986H734Z"
        />
      </g>
      <g className="booth-lines">
        <path
          className="booth-outline"
          pathLength="1"
          d="M204 287H974V598M734 598H1186L1194 613V986L1186 995H734ZM734 614H1186M734 974H1186"
        />
        <path
          className="booth-outline"
          pathLength="1"
          d="M790 598Q760 520 822 550Q857 560 893 598M1102 393H1135L1141 468L1135 546H1102ZM1110 393V546M1162 430H1179L1167 590H1145ZM1138 463H1156M1138 475H1155"
        />
        <path
          className="booth-outline"
          pathLength="1"
          d="M970 591Q983 568 1002 582L1015 591Z M1019 584H1087V592H1019ZM1023 581H1081"
        />
      </g>
    </svg>
  );
}

function FrontView() {
  return (
    <svg
      viewBox="0 0 1326 1142"
      role="img"
      aria-label="Small booth front elevation with monitor and geometric mark"
    >
      <g className="small-booth-panels">
        <path
          className="booth-fill booth-outline"
          pathLength="1"
          d="M118 365H338V1063H118ZM338 145H558V365H338ZM558 365H785V583H558ZM785 145H1222V1064H1003V365H785ZM603 760H785V1060H603Z"
        />
        <path
          className="booth-fill booth-outline"
          pathLength="1"
          d="M118 676H603V1064H118Z"
        />
        <path
          className="booth-fill booth-outline"
          pathLength="1"
          d="M215 471H558V624H215Z"
        />
      </g>
      <g className="booth-lines">
        <path
          className="booth-outline"
          pathLength="1"
          d="M1107 145V1064M603 981H785M118 692H603M137 1051H603M118 676L137 692V1051L118 1064"
        />
        <path
          className="booth-outline"
          pathLength="1"
          d="M378 506H396V673H378ZM332 577H442V624H332ZM341 673H466M382 637H391M424 675Q487 595 532 646L526 675"
        />
        <path
          className="booth-outline"
          pathLength="1"
          d="M185 659H307L319 672H180ZM166 671Q154 657 174 654L183 660L180 672"
        />
        {Array.from({ length: 10 }, (_, i) => (
          <path
            key={i}
            className="booth-outline booth-fine"
            pathLength="1"
            d={`M${193 + i * 10} 660V667`}
          />
        ))}
      </g>
    </svg>
  );
}

function TopView() {
  return (
    <svg
      viewBox="0 0 940 956"
      role="img"
      aria-label="Small booth top view with L-shaped desk, chair and display"
    >
      <g className="small-booth-panels">
        <path
          className="booth-fill booth-outline"
          pathLength="1"
          d="M110 112H885V890H110ZM110 112H188V890H110Z"
        />
        <path
          className="booth-fill booth-outline"
          pathLength="1"
          d="M764 548H884V888H560V774L759 761Z"
        />
      </g>
      <g className="booth-lines">
        <path
          className="booth-outline"
          pathLength="1"
          d="M188 193H885M560 877H877V548M582 384L587 386L584 395L579 393Z"
        />
        <path
          className="booth-outline"
          pathLength="1"
          d="M657 564L766 655L673 762L569 672ZM660 596Q609 591 598 645Q590 696 665 748Q699 721 743 661Q716 618 660 596Z"
        />
        <path
          className="booth-outline"
          pathLength="1"
          d="M820 580Q864 689 835 823L830 823Q846 691 815 582ZM804 655L840 650V741L803 731ZM840 691H860V703H840"
        />
        <path
          className="booth-outline"
          pathLength="1"
          d="M778 749L815 760L788 836L754 823ZM729 846Q732 832 748 840L760 846L755 860H738Z"
        />
        {Array.from({ length: 10 }, (_, i) => (
          <path
            key={i}
            className="booth-outline booth-fine"
            pathLength="1"
            d={`M${777 - i * 2} ${755 + i * 7}l29 9`}
          />
        ))}
      </g>
    </svg>
  );
}

export function SmallBoothViews() {
  return (
    <div className="small-booth-content">
      <div className="small-booth-grid">
        {[
          { name: 'Side view', drawing: <SideView /> },
          { name: 'Front view', drawing: <FrontView /> },
          { name: 'Top view', drawing: <TopView /> },
        ].map((view) => (
          <figure key={view.name}>
            <div>{view.drawing}</div>
            <figcaption>{view.name}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
