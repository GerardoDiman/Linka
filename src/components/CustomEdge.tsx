import { memo } from 'react'
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow'
import { CustomEdgeData } from '../types/notion'


const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected
}: EdgeProps<CustomEdgeData>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      {data ? (
        <path
          id={id}
          style={style}
          className={`react-flow__edge-path cursor-pointer ${selected ? 'custom-edge selected' : 'custom-edge'}`}
          d={edgePath}
          strokeWidth={selected ? 3 : 2}
          stroke={selected ? '#3b82f6' : '#6b7280'}
          fill="none"
          markerEnd="url(#arrowhead)"
        />
      ) : (
        <path
          id={id}
          style={style}
          className={`react-flow__edge-path ${selected ? 'custom-edge selected' : 'custom-edge'}`}
          d={edgePath}
          strokeWidth={selected ? 3 : 2}
          stroke={selected ? '#3b82f6' : '#6b7280'}
          fill="none"
          markerEnd="url(#arrowhead)"
        />
      )}
      
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="px-2 py-1 bg-white border border-gray-200 rounded shadow-sm text-gray-700"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
      
      {/* Arrowhead marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={selected ? '#3b82f6' : '#6b7280'}
          />
        </marker>
      </defs>
    </>
  )
})

CustomEdge.displayName = 'CustomEdge'

export default CustomEdge 