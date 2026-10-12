import { useMemo } from "react";

/**
 * Flat SVG preview of one frame of a visualization plan.
 *
 * Plans use world units (items about 1.4 apart, y pointing up). SVG's y
 * points down, so every y is flipped. Each object is a <g> placed with a CSS
 * transform and keyed by its id, so swaps and moves animate between steps.
 */

const SCALE = 40; // SVG units per world unit
const PADDING = 30;
const BAR_WIDTH = 32;
const BAR_MIN_HEIGHT = 12;
const BAR_MAX_HEIGHT = 110;
const BOX_SIZE = 38;
const NODE_RADIUS = 20;
const LABEL_CHAR_WIDTH = 8;
const OBJECT_HALF_SIZE = 24;

const toSvg = ([x, y]) => [x * SCALE, -y * SCALE];

function barHeight(value, maxValue) {
  return (
    BAR_MIN_HEIGHT + (Math.abs(value) / maxValue) * (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT)
  );
}

// The area an object covers, in SVG units.
function extent(object, maxValue) {
  const [x, y] = toSvg(object.position);

  if (object.type === "bar") {
    const half = BAR_WIDTH / 2;
    return { left: x - half, right: x + half, top: y - barHeight(object.value, maxValue), bottom: y + 24 };
  }

  const half =
    object.type === "label"
      ? (object.label.length * LABEL_CHAR_WIDTH) / 2 + 4
      : OBJECT_HALF_SIZE;

  return { left: x - half, right: x + half, top: y - OBJECT_HALF_SIZE, bottom: y + OBJECT_HALF_SIZE };
}

// One view box that fits every frame, so the picture doesn't jump between steps.
function measure(frames) {
  const objects = frames.flatMap((frame) => frame.objects);
  const maxValue = Math.max(
    1,
    ...objects.filter((object) => object.type === "bar").map((object) => Math.abs(object.value)),
  );

  if (objects.length === 0) return { maxValue, viewBox: "-100 -60 200 120" };

  const boxes = objects.map((object) => extent(object, maxValue));
  const left = Math.min(...boxes.map((box) => box.left)) - PADDING;
  const right = Math.max(...boxes.map((box) => box.right)) + PADDING;
  const top = Math.min(...boxes.map((box) => box.top)) - PADDING;
  const bottom = Math.max(...boxes.map((box) => box.bottom)) + PADDING;

  return { maxValue, viewBox: `${left} ${top} ${right - left} ${bottom - top}` };
}

function Shape({ object, maxValue }) {
  switch (object.type) {
    case "bar": {
      const height = barHeight(object.value, maxValue);

      return (
        <>
          <rect x={-BAR_WIDTH / 2} y={-height} width={BAR_WIDTH} height={height} rx={4} />
          <text y={14}>{object.label}</text>
        </>
      );
    }

    case "box":
      return (
        <>
          <rect x={-BOX_SIZE / 2} y={-BOX_SIZE / 2} width={BOX_SIZE} height={BOX_SIZE} rx={6} />
          <text>{object.label}</text>
        </>
      );

    case "node":
      return (
        <>
          <circle r={NODE_RADIUS} />
          <text>{object.label}</text>
        </>
      );

    case "pointer":
      return (
        <>
          <path d="M 0 -22 L -7 -10 L 7 -10 Z" />
          <text y={4}>{object.label}</text>
        </>
      );

    default:
      return <text>{object.label}</text>;
  }
}

function Arrow({ relationship, objectsById }) {
  const from = objectsById.get(relationship.from);
  const to = objectsById.get(relationship.to);
  const [x1, y1] = toSvg(from.position);
  const [x2, y2] = toSvg(to.position);
  const length = Math.hypot(x2 - x1, y2 - y1);

  // Two objects in the same spot: there is nothing to draw between them.
  if (length < NODE_RADIUS * 2) return null;

  // Start and end at the edge of each object, not at its centre.
  const gap = NODE_RADIUS + 4;
  const dx = (x2 - x1) / length;
  const dy = (y2 - y1) / length;

  return (
    <g className="plan-arrow">
      <line
        x1={x1 + dx * gap}
        y1={y1 + dy * gap}
        x2={x2 - dx * (gap + 2)}
        y2={y2 - dy * (gap + 2)}
        markerEnd="url(#plan-arrowhead)"
      />
      {relationship.label && (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 9}>
          {relationship.label}
        </text>
      )}
    </g>
  );
}

function PlanPreview({ frames, index }) {
  const { maxValue, viewBox } = useMemo(() => measure(frames), [frames]);
  const frame = frames[index];
  const objectsById = new Map(frame.objects.map((object) => [object.id, object]));

  return (
    <svg
      className="plan-preview"
      viewBox={viewBox}
      role="img"
      aria-label={`Scene after step ${index + 1}`}
    >
      <defs>
        <marker
          id="plan-arrowhead"
          className="plan-arrowhead"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>

      {frame.relationships.map((relationship) => (
        <Arrow
          key={relationship.id}
          relationship={relationship}
          objectsById={objectsById}
        />
      ))}

      {frame.objects.map((object) => {
        const [x, y] = toSvg(object.position);

        return (
          <g
            key={object.id}
            className={`plan-object plan-${object.type} plan-state-${object.state}`}
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <Shape object={object} maxValue={maxValue} />
          </g>
        );
      })}
    </svg>
  );
}

export default PlanPreview;
