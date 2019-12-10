<script>
const ROOT_LEVLE_PID = 'ROOT_LEVLE_PID';
export default {
  data() {
    return {
      nodeStyleMap: {},
      diagramWidth: 0,
      diagramHeight: 0,
      startEmptySpace: 0,
      linkPath: '',
    };
  },
  components: {},
  methods: {
    handleNodePosition() {
      this.$emit('before-justify-node');
      this.$nextTick(() => {
        const { nodePad, levelPad } = this;
        const {
          PIDMap, ChildIDMap, levelID, maxLevel,
        } = this.nodeInfo;
        const nodeStyleMap = {};
        const levelMaxHeightMap = {};
        const nodeOffsetWidth = {};
        let scaleW = null;
        let scaleH = null;
        const getNodeSize = (id) => {
          if (!nodeStyleMap[id]) {
            let {
              width, height,
            } = this.$refs[`node-${id}`].getBoundingClientRect();
            if (scaleW === null && width > 0 && height > 0) {
              const offsetW = this.$refs[`node-${id}`].offsetWidth;
              const offsetH = this.$refs[`node-${id}`].offsetHeight;
              scaleW = offsetW / width;
              scaleH = offsetH / height;
            }
            if (scaleW) {
              width *= scaleW;
              height *= scaleH;
            }
            nodeStyleMap[id] = {
              width, height, top: 0, childPad: 0,
            };
          }
          return nodeStyleMap[id];
        };
        const getNodeOffsetWidth = (id) => {
          if (!nodeOffsetWidth[id]) {
            let thisNodeOffsetWidth = 0;
            if (ChildIDMap[id] && ChildIDMap[id].length) {
              ChildIDMap[id].forEach((cid) => {
                thisNodeOffsetWidth += getNodeOffsetWidth(cid);
              });
            }
            nodeOffsetWidth[id] = Math.max(getNodeSize(id).width, thisNodeOffsetWidth);
          }
          return nodeOffsetWidth[id];
        };
        const getChildSpaceRange = (id) => {
          const childIDArr = ChildIDMap[id];
          if (childIDArr && childIDArr.length) {
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
        };
        for (let level = maxLevel; level >= 0; level -= 1) {
          const thisLevelIDArr = levelID[level] || [];
          let startNoChildNodeCount = 0;
          let nodeToLeft = 0;
          let childPadLeft = 0;
          let thisLevelMaxHeight = 0;
          let spaceForPrey = 0;
          for (let levelIDIndex = 0; levelIDIndex < thisLevelIDArr.length; levelIDIndex += 1) {
            const id = thisLevelIDArr[levelIDIndex];
            const nextId = thisLevelIDArr[levelIDIndex + 1];
            const prevId = thisLevelIDArr[levelIDIndex - 1];
            const { width, height } = getNodeSize(id);
            thisLevelMaxHeight = Math.max(thisLevelMaxHeight, height);
            const thisNodeOffsetWidth = getNodeOffsetWidth(id);
            let preyPrevSpace = 0;
            let preyNextSpace = 0;
            if (!ChildIDMap[id] || ChildIDMap[id].length === 0) {
              if (levelIDIndex === 0 || startNoChildNodeCount > 0) {
                startNoChildNodeCount += 1;
              }
              childPadLeft += width + nodePad;
              spaceForPrey += width + nodePad;
              if (prevId !== undefined && ChildIDMap[prevId] && ChildIDMap[prevId].length) {
                const { width: prevNodeWidth, left: prevNodeLeft } = getNodeSize(prevId);
                const space = nodeToLeft - prevNodeLeft - prevNodeWidth - nodePad;
                if (space > 0) {
                  preyPrevSpace = Math.min(spaceForPrey, space);
                  spaceForPrey -= preyPrevSpace;
                  childPadLeft -= preyPrevSpace;
                  nodeToLeft -= preyPrevSpace;
                }
              }
              if (spaceForPrey && nextId !== undefined && ChildIDMap[nextId] && ChildIDMap[nextId].length) {
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
                nodeStyleMap[id].left = childSpaceStart + gapSpace;
                nodeToLeft = nodeStyleMap[id].left + width + nodePad;
                while (
                  PIDMap[thisLevelIDArr[levelIDIndex + 1]] === PIDMap[id]
                  && (ChildIDMap[thisLevelIDArr[levelIDIndex + 1]] || []).length === 0
                ) {
                  levelIDIndex += 1;
                  const cursorId = thisLevelIDArr[levelIDIndex];
                  const { width: cursorNodeWidth } = getNodeSize(cursorId);
                  nodeStyleMap[cursorId].left = nodeToLeft;
                  nodeToLeft += cursorNodeWidth + nodePad;
                }
                if (nodeToLeft > childSpaceEnd) {
                  childPadLeft += nodeToLeft - childSpaceEnd;
                } else {
                  nodeToLeft = childSpaceEnd;
                }
              } else {
                nodeStyleMap[id].childPad += gapSpace;
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
        let linkPath = '';
        const distNodeStyleMap = {};
        const drawLine = (id) => {
          const PID = PIDMap[id];
          if (PID !== ROOT_LEVLE_PID) {
            const p = nodeStyleMap[PID];
            const n = nodeStyleMap[id];
            linkPath += `M${p.left + p.width / 2} ${p.top + p.height} L${n.left + n.width / 2} ${n.top} `;
          }
        };
        for (let level = 0, thisLevelToTop = 0; level <= maxLevel; level += 1) {
          const thisLevelIDArr = levelID[level] || [];
          const thisLevelMaxHeight = levelMaxHeightMap[level];

          for (let levelIDIndex = 0; levelIDIndex < thisLevelIDArr.length; levelIDIndex += 1) {
            const id = thisLevelIDArr[levelIDIndex];
            const { width, height } = nodeStyleMap[id];
            const { childPad } = nodeStyleMap[PIDMap[id]] || { childPad: 0 };
            nodeStyleMap[id].top = thisLevelToTop + (thisLevelMaxHeight - height) / 2;
            nodeStyleMap[id].left += childPad;
            nodeStyleMap[id].childPad += childPad;

            distNodeStyleMap[id] = {
              top: `${nodeStyleMap[id].top}px`,
              left: `${nodeStyleMap[id].left}px`,
            };

            startEmptySpace = Math.min(startEmptySpace, nodeStyleMap[id].left);
            diagramWidth = Math.max(diagramWidth, nodeStyleMap[id].left + width);
            diagramHeight = Math.max(diagramHeight, nodeStyleMap[id].top + height);

            drawLine(id);
          }
          thisLevelToTop += thisLevelMaxHeight + levelPad;
        }
        this.startEmptySpace = startEmptySpace < diagramWidth ? startEmptySpace : 0;
        this.diagramWidth = diagramWidth;
        this.diagramHeight = diagramHeight;
        this.linkPath = linkPath;
        this.nodeStyleMap = distNodeStyleMap;
        this.$nextTick(() => {
          this.$emit('after-justify-node');
        });
      });
    },
  },
  mounted() {
  },
  watch: {

  },
  computed: {
    nodeInfo() {
      const list = [];
      const PIDMap = {};
      const ChildIDMap = {};
      const levelID = {};
      const existID = {};
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
        list.push({ id, PID, node });
        maxLevel = Math.max(level, maxLevel);
        if (node.children && node.children.forEach) {
          node.children.forEach((cnode) => pushNode(cnode, id, level + 1));
        }
      };
      this.data.forEach((node) => pushNode(node, ROOT_LEVLE_PID, 0));
      return {
        list, PIDMap, ChildIDMap, levelID, maxLevel,
      };
    },
  },
  props: {
    data: null,
    nodePad: {
      type: Number,
      default: 1,
    },
    levelPad: {
      type: Number,
      default: 10,
    },
  },
  render(createElement) {
    const renderNode = ({ id, node }) => {
      const rNode = this.$scopedSlots[node.type] || this.$scopedSlots.default;
      return createElement(
        'div',
        {
          staticClass: 'node-wrap',
          style: this.nodeStyleMap[id] || { left: 0, top: 0 },
          key: id,
          ref: `node-${id}`,
          attrs: { 'node-id': id },
        },
        [rNode ? rNode(node) : null],
      );
    };
    // eslint-disable-next-line no-underscore-dangle
    const content = this._l(this.nodeInfo.list, renderNode);
    content.unshift(createElement(
      'svg',
      {
        attrs: { width: this.diagramWidth, height: this.diagramHeight },
        style: { width: `${this.diagramWidth}px`, height: `${this.diagramHeight}px` },
      },
      [createElement('path', {
        attrs: { d: this.linkPath },
      })],
    ));
    return createElement(
      'div',
      { staticClass: 'wrap', style: { 'margin-left': `${-this.startEmptySpace}px` } },
      content,
    );
  },
};
</script>

<style scoped>
.wrap {
  position: relative;
  white-space: nowrap;
}
.node-wrap {
  position: absolute;
  /* transition: all 0.1s linear; */
}
path {
  fill: transparent;
  stroke: #000;
  stroke-width: 2;
}
</style>
