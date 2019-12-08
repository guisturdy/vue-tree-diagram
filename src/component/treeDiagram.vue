<script>
const ROOT_LEVLE_PID = 'ROOT_LEVLE_PID';
export default {
  data() {
    return {
      nodeStyleMap: {},
      diagramWidth: 0,
      diagramHeight: 0,
      linkPath: '',
    };
  },
  components: {},
  methods: {
    handleNodePosition() {
      this.$nextTick(() => {
        const nodePad = 0;
        const levelPad = 33;
        const {
          list, PIDMap, ChildIDMap, levelID, maxLevel,
        } = this.nodeInfo;
        const nodeStyleMap = {};
        const levelMaxHeightMap = {};
        const nodeOffsetWidth = {};
        const doChildPadLeft = (id, size) => {
          if (ChildIDMap[id]) {
            ChildIDMap[id].forEach((cid) => {
              nodeStyleMap[cid].left += size;
              doChildPadLeft(cid, size);
            });
          }
        };
        for (let level = maxLevel; level >= 0; level -= 1) {
          const thisLevelIDArr = levelID[level];
          let nodeToLeft = 0;
          let childPadLeft = 0;
          let thisLevelMaxHeight = 0;
          thisLevelIDArr.forEach((id) => {
            const {
              width, height,
            } = this.$refs[`node-${id}`].getBoundingClientRect();
            thisLevelMaxHeight = Math.max(thisLevelMaxHeight, height);
            let thisNodeOffsetWidth = 0;
            if (ChildIDMap[id] && ChildIDMap[id].length) {
              ChildIDMap[id].forEach((cid) => {
                thisNodeOffsetWidth += nodeOffsetWidth[cid];
              });
              nodeOffsetWidth[id] = Math.max(width, thisNodeOffsetWidth);
            } else {
              thisNodeOffsetWidth = width;
              childPadLeft += width + nodePad;
            }
            nodeOffsetWidth[id] = thisNodeOffsetWidth;
            nodeStyleMap[id] = {
              top: 0,
              left: nodeToLeft + (thisNodeOffsetWidth - width) / 2,
              width,
              height,
            };
            nodeToLeft += thisNodeOffsetWidth + nodePad;
            doChildPadLeft(id, childPadLeft);
          });
          levelMaxHeightMap[level] = thisLevelMaxHeight;
        }
        for (let level = 0, thisLevelToTop = 0; level <= maxLevel; level += 1) {
          const thisLevelIDArr = levelID[level];
          const thisLevelMaxHeight = levelMaxHeightMap[level];

          thisLevelIDArr.forEach((id) => {
            const { height } = nodeStyleMap[id];
            nodeStyleMap[id].top = thisLevelToTop + (thisLevelMaxHeight - height) / 2;
          });
          thisLevelToTop += thisLevelMaxHeight + levelPad;
        }
        let diagramWidth = 0;
        let diagramHeight = 0;
        let linkPath = '';
        const distNodeStyleMap = {};
        const drawLine = (node) => {
          const PID = PIDMap[node.id];
          if (PID !== ROOT_LEVLE_PID) {
            const p = nodeStyleMap[PID];
            const n = nodeStyleMap[node.id];
            linkPath += `M${p.left + p.width / 2} ${p.top + p.height} L${n.left + n.width / 2} ${n.top} `;
          }
        };
        list.forEach((node) => {
          const {
            left, top, width, height,
          } = nodeStyleMap[node.id];
          distNodeStyleMap[node.id] = {
            top: `${top}px`,
            left: `${left}px`,
          };
          drawLine(node);
          diagramWidth = Math.max(diagramWidth, left + width);
          diagramHeight = Math.max(diagramHeight, top + height);
        });
        this.diagramWidth = diagramWidth;
        this.diagramHeight = diagramHeight;
        this.linkPath = linkPath;
        this.nodeStyleMap = distNodeStyleMap;
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
      { staticClass: 'wrap' },
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
  transition: all 0.1s linear;
}
path {
  fill: transparent;
  stroke: #000;
  stroke-width: 2;
}
</style>
