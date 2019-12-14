const ROOT_LEVLE_PID = 'ROOT_LEVLE_PID';

class NodePositionUtil {
  constructor(
    nodePad, levelPad, direction, align,
    list, PIDMap, indexMap, ChildIDMap, levelID, maxLevel,
    getNodeRef,
  ) {
    this.config = {
      nodePad,
      levelPad,
      direction,
      align,
      list,
      PIDMap,
      indexMap,
      ChildIDMap,
      levelID,
      maxLevel,
    };
    this.getNodeRef = getNodeRef;

    this.nodeStyleMap = {};
    this.levelMaxHeightMap = {};
    this.nodeOffsetWidth = {};
    this.scaleW = null;
    this.scaleH = null;

    this.hasChild = this.hasChild.bind(this);
    this.getNodeType = this.getNodeType.bind(this);
    this.getNodeSize = this.getNodeSize.bind(this);
    this.getNodeOffsetWidth = this.getNodeOffsetWidth.bind(this);
    this.getChildSpaceRange = this.getChildSpaceRange.bind(this);
  }

  getNodeType(id) {
    const { list, indexMap } = this.config;
    return list[indexMap[id]].node.type;
  }

  hasChild(id) {
    const { ChildIDMap } = this.config;
    return ChildIDMap[id] && ChildIDMap[id].length > 0;
  }

  getNodeSize(id) {
    const { nodeStyleMap, scaleW } = this;
    const { direction } = this.config;
    if (!nodeStyleMap[id]) {
      const $nodeRef = this.getNodeRef(id);
      let {
        width, height,
      } = $nodeRef.getBoundingClientRect();
      if (scaleW === null && width > 0 && height > 0) {
        const offsetW = $nodeRef.offsetWidth;
        const offsetH = $nodeRef.offsetHeight;
        this.scaleW = offsetW / width;
        this.scaleH = offsetH / height;
      }
      if (this.scaleW) {
        width *= this.scaleW;
        height *= this.scaleH;
      }
      switch (direction) {
        case 'l-r':
          nodeStyleMap[id] = {
            width: height, height: width, top: 0, childPad: 0,
          };
          break;
        default: // t-b
          nodeStyleMap[id] = {
            width, height, top: 0, childPad: 0,
          };
      }
    }
    return nodeStyleMap[id];
  }

  getNodeOffsetWidth(id) {
    const {
      nodeOffsetWidth,
      getChildSpaceRange, getNodeSize, hasChild,
    } = this;
    if (!nodeOffsetWidth[id]) {
      let thisNodeOffsetWidth = 0;
      if (hasChild(id)) {
        thisNodeOffsetWidth = getChildSpaceRange(id).space;
      }
      nodeOffsetWidth[id] = Math.max(getNodeSize(id).width, thisNodeOffsetWidth);
    }
    return nodeOffsetWidth[id];
  }

  getChildSpaceRange(id) {
    const { ChildIDMap, nodePad } = this.config;
    const { getNodeSize, hasChild } = this;
    if (hasChild(id)) {
      const childIDArr = ChildIDMap[id];
      const { childPad } = getNodeSize(id);
      const lastChildInfo = getNodeSize(childIDArr[childIDArr.length - 1]);
      const childSpaceStart = getNodeSize(childIDArr[0]).left;
      const childSpaceEnd = lastChildInfo.left + lastChildInfo.width + nodePad;
      return {
        start: childSpaceStart + childPad,
        end: childSpaceEnd + childPad,
        space: childSpaceEnd - childSpaceStart,
      };
    }
    return null;
  }

  distributionNodePosition() {
    const {
      nodePad, levelPad, direction, align,
      PIDMap, levelID, maxLevel,
    } = this.config;
    const {
      nodeStyleMap, levelMaxHeightMap,
      getNodeSize, getNodeOffsetWidth, getChildSpaceRange, hasChild, getNodeType,
    } = this;

    for (let level = maxLevel; level >= 0; level -= 1) {
      const thisLevelIDArr = levelID[level] || [];
      let startNoChildNodeCount = 0;
      let nodeToLeft = 0;
      let childPadLeft = 0;
      let thisLevelMaxHeight = 0;
      let spaceForPrey = 0;
      /**
       *  |###############| <- spaceForPrey
       *  |:NC-1:| |:NC-2:| |::NodeX::| |:NC-3:| |::::::NC-4::::::| |::NodeY::|
       *                      /     \                                 /     \
       *      |:::NodeX-Child:::| |:::NodeX-Child:::| |:::NodeY-Child:::| |:::NodeY-Child:::|
       *              preyPrevSpace of NC-4 -> |####| |#############| <- preyNextSpace of NC-4
       *
       * ps:   NC  => no child node
       */
      for (let levelIDIndex = 0; levelIDIndex < thisLevelIDArr.length; levelIDIndex += 1) {
        const id = thisLevelIDArr[levelIDIndex];
        const nextId = thisLevelIDArr[levelIDIndex + 1];
        const prevId = thisLevelIDArr[levelIDIndex - 1];
        const { width, height } = getNodeSize(id);
        thisLevelMaxHeight = Math.max(thisLevelMaxHeight, height);
        const thisNodeOffsetWidth = getNodeOffsetWidth(id);
        let preyPrevSpace = 0;
        let preyNextSpace = 0;
        if (!hasChild(id)) {
          if (levelIDIndex === 0 || startNoChildNodeCount > 0) {
            startNoChildNodeCount += 1;
          }
          childPadLeft += width + nodePad;
          spaceForPrey += width + nodePad;
          if (hasChild(prevId)) {
            const { width: prevNodeWidth, left: prevNodeLeft } = getNodeSize(prevId);
            const space = nodeToLeft - prevNodeLeft - prevNodeWidth - nodePad;
            if (space > 0) {
              preyPrevSpace = Math.min(spaceForPrey, space);
              spaceForPrey -= preyPrevSpace;
              childPadLeft -= preyPrevSpace;
              nodeToLeft -= preyPrevSpace;
            }
          }
          if (spaceForPrey && hasChild(nextId)) {
            const { space: nextNodeOffsetWidth } = getChildSpaceRange(nextId);
            const nextNodeWidth = getNodeSize(nextId).width;
            const space = (nextNodeOffsetWidth - nextNodeWidth) / 2 - nodePad;
            if (space > 0) {
              preyNextSpace = Math.min(spaceForPrey, space);
              childPadLeft -= preyNextSpace;
            }
            spaceForPrey = 0;
          }
          nodeStyleMap[id].left = nodeToLeft;
          nodeToLeft += thisNodeOffsetWidth + nodePad - preyNextSpace;
        } else {
          nodeStyleMap[id].childPad += childPadLeft;
          const {
            start: childSpaceStart,
            end: childSpaceEnd,
            space: childSpace,
          } = getChildSpaceRange(id);
          const gapSpace = Math.abs((childSpace - width) / 2);
          if (childSpace > width) {
            /** like this
             *                    |::NodeX::|
             *                      /     \
             *      |:::NodeX-Child:::| |:::NodeX-Child:::|
             */
            nodeStyleMap[id].left = childSpaceStart + gapSpace;
            nodeToLeft = nodeStyleMap[id].left + width + nodePad;
            let usedGapSpace = 0;
            while (
              levelIDIndex + 1 < thisLevelIDArr.length
              && !hasChild(thisLevelIDArr[levelIDIndex + 1])
            ) {
              levelIDIndex += 1;
              const cursorId = thisLevelIDArr[levelIDIndex];
              const { width: cursorNodeWidth } = getNodeSize(cursorId);
              nodeStyleMap[cursorId].left = nodeToLeft;
              nodeToLeft += cursorNodeWidth + nodePad;
              usedGapSpace += cursorNodeWidth + nodePad;
              if (usedGapSpace > gapSpace + nodePad) {
                break;
              }
            }
            if (nodeToLeft > childSpaceEnd) {
              childPadLeft += nodeToLeft - childSpaceEnd;
            } else {
              nodeToLeft = childSpaceEnd;
            }
          } else {
            // nodeStyleMap[id].childPad += gapSpace;
            nodeStyleMap[id].left = childSpaceStart - gapSpace;
            nodeToLeft = childSpaceEnd + gapSpace;
          }
          if (startNoChildNodeCount > 0) {
            const { width: prevNodeWidth, left: prevNodeLeft } = getNodeSize(prevId);
            const canPreySpace = nodeStyleMap[id].left - nodePad - prevNodeWidth - prevNodeLeft;
            if (canPreySpace > 0) {
              for (let index = 0; index < startNoChildNodeCount; index += 1) {
                nodeStyleMap[thisLevelIDArr[index]].left += canPreySpace;
              }
            }
            startNoChildNodeCount = 0;
          }
        }
      }
      levelMaxHeightMap[level] = thisLevelMaxHeight;
    }
    let startEmptySpace = Number.MAX_SAFE_INTEGER;
    let diagramWidth = 0;
    let diagramHeight = 0;
    const linkPath = {};

    let drawLine;
    let setupNodeStyleAndDiagramSize;
    switch (direction) {
      case 'l-r':
        drawLine = (id) => {
          const PID = PIDMap[id];
          // not top level
          if (PIDMap[PID]) {
            const p = nodeStyleMap[PID];
            const n = nodeStyleMap[id];
            const pNodeType = getNodeType(PID);
            linkPath[pNodeType] = linkPath[pNodeType] || [];
            linkPath[pNodeType] += `M${p.top + p.height} ${p.left + p.width / 2} L${n.top} ${n.left + n.width / 2} `;
          }
        };
        setupNodeStyleAndDiagramSize = (id) => {
          const $nodeRef = this.getNodeRef(id);
          const {
            left, top, width, height,
          } = nodeStyleMap[id];
          $nodeRef.style.left = `${top}px`;
          $nodeRef.style.top = `${left}px`;

          diagramHeight = Math.max(diagramHeight, nodeStyleMap[id].left + width);
          diagramWidth = Math.max(diagramWidth, nodeStyleMap[id].top + height);
        };
        break;
      default: // t-b
        drawLine = (id) => {
          const PID = PIDMap[id];
          // not top level
          if (PIDMap[PID]) {
            const p = nodeStyleMap[PID];
            const n = nodeStyleMap[id];
            const pNodeType = getNodeType(PID);
            linkPath[pNodeType] = linkPath[pNodeType] || [];
            linkPath[pNodeType] += `M${p.left + p.width / 2} ${p.top + p.height} L${n.left + n.width / 2} ${n.top} `;
          }
        };
        setupNodeStyleAndDiagramSize = (id) => {
          const $nodeRef = this.getNodeRef(id);
          const {
            left, top, width, height,
          } = nodeStyleMap[id];
          $nodeRef.style.left = `${left}px`;
          $nodeRef.style.top = `${top}px`;

          diagramWidth = Math.max(diagramWidth, left + width);
          diagramHeight = Math.max(diagramHeight, top + height);
        };
    }

    for (let level = 0, thisLevelToTop = 0; level <= maxLevel; level += 1) {
      const thisLevelIDArr = levelID[level] || [];
      const thisLevelMaxHeight = levelMaxHeightMap[level];

      for (let levelIDIndex = 0; levelIDIndex < thisLevelIDArr.length; levelIDIndex += 1) {
        const id = thisLevelIDArr[levelIDIndex];
        const { height } = nodeStyleMap[id];
        const { childPad } = nodeStyleMap[PIDMap[id]] || { childPad: 0 };
        switch (align) {
          case 'center':
            nodeStyleMap[id].top = thisLevelToTop + (thisLevelMaxHeight - height) / 2;
            break;
          case 'end':
            nodeStyleMap[id].top = thisLevelToTop + (thisLevelMaxHeight - height);
            break;
          default: // start
            nodeStyleMap[id].top = thisLevelToTop;
        }
        nodeStyleMap[id].left += childPad;
        nodeStyleMap[id].childPad += childPad;

        startEmptySpace = Math.min(startEmptySpace, nodeStyleMap[id].left);
        setupNodeStyleAndDiagramSize(id);
        drawLine(id);
      }
      thisLevelToTop += thisLevelMaxHeight + levelPad;
    }

    startEmptySpace = startEmptySpace === Number.MAX_SAFE_INTEGER ? 0 : startEmptySpace;

    return {
      startEmptySpace,
      diagramWidth,
      diagramHeight,
      linkPath,
    };
  }
}
function distributionNodePosition(
  nodePad, levelPad, direction, align,
  list, PIDMap, indexMap, ChildIDMap, levelID, maxLevel,
  getNodeRef,
) {
  const npu = new NodePositionUtil(
    nodePad, levelPad, direction, align,
    list, PIDMap, indexMap, ChildIDMap, levelID, maxLevel,
    getNodeRef,
  );
  return npu.distributionNodePosition();
}
function getNodeInfo(data = []) {
  const list = [];
  const PIDMap = {};
  const ChildIDMap = {};
  const levelID = {};
  const existID = {};
  const indexMap = {};
  let maxLevel = 0;
  const pushNode = (node, PID, level) => {
    let id = node.id || Math.random();
    if (existID[id]) {
      id = Math.random();
    }
    existID[id] = true;
    PIDMap[id] = PID;
    ChildIDMap[PID] = ChildIDMap[PID] || [];
    ChildIDMap[PID].push(id);
    levelID[level] = levelID[level] || [];
    levelID[level].push(id);
    indexMap[id] = list.length;
    list.push({ id, PID, node });
    maxLevel = Math.max(level, maxLevel);
    if (node.children && node.children.forEach) {
      node.children.forEach((cnode) => pushNode(cnode, id, level + 1));
    }
  };
  data.forEach((node) => pushNode(node, ROOT_LEVLE_PID, 0));
  return {
    list, indexMap, PIDMap, ChildIDMap, levelID, maxLevel,
  };
}
export default {
  distributionNodePosition,
  getNodeInfo,
};
