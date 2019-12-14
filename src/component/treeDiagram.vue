<script>
import util from './util';

export default {
  data() {
    return {
      diagramWidth: 0,
      diagramHeight: 0,
      startEmptySpace: 0,
      linkPath: '',
    };
  },
  components: {},
  methods: {
    handleNodePosition() {
      this.$emit('before-render-node');
      this.$nextTick(() => {
        const { nodePad, levelPad, direction } = this;
        const {
          PIDMap, ChildIDMap, levelID, maxLevel,
        } = this.nodeInfo;
        const getNodeRef = (id) => this.$refs[`node-${id}`];
        const {
          startEmptySpace,
          diagramWidth,
          diagramHeight,
          linkPath,
        } = util.distributionNodePosition(
          nodePad, levelPad, direction,
          PIDMap, ChildIDMap, levelID, maxLevel,
          getNodeRef,
        );
        this.startEmptySpace = startEmptySpace;
        this.diagramWidth = diagramWidth;
        this.diagramHeight = diagramHeight;
        this.linkPath = linkPath;
        this.$emit('after-render-node');
      });
    },
    handleNodeClick(e) {
      let node;
      if (e.path) {
        for (let i = 0; i < e.path.length; i += 1) {
          const v = e.path[i];
          const nodeIndex = v && v.getAttribute && v.getAttribute('node-index');
          if (nodeIndex) {
            node = this.nodeInfo.list[nodeIndex].node;
            break;
          }
        }
      }
      if (node) {
        this.$emit('node-click', node, e);
      }
    },
  },
  mounted() {
  },
  watch: {
    nodeInfo() {
      this.handleNodePosition();
    },
    nodePad() {
      this.handleNodePosition();
    },
    levelPad() {
      this.handleNodePosition();
    },
    direction() {
      this.handleNodePosition();
    },
  },
  computed: {
    nodeInfo() {
      return util.getNodeInfo(this.data);
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
    direction: {
      type: String,
      default: 'l-r',
    },
  },
  render(createElement) {
    const {
      diagramWidth, diagramHeight, linkPath, startEmptySpace,
      nodeInfo, direction,
      $scopedSlots, _l,
    } = this;
    const renderNode = ({ id, node }, index) => {
      const rNode = $scopedSlots[node.type] || $scopedSlots.default;
      return createElement(
        'div',
        {
          staticClass: 'node-wrap',
          key: id,
          ref: `node-${id}`,
          attrs: { 'node-index': index },
          on: {
            click: this.handleNodeClick,
          },
        },
        [rNode ? rNode(node) : null],
      );
    };
    // eslint-disable-next-line no-underscore-dangle
    const content = _l(nodeInfo.list, renderNode);
    content.unshift(createElement(
      'svg',
      {
        attrs: { width: diagramWidth, height: diagramHeight },
        style: { width: `${diagramWidth}px`, height: `${diagramHeight}px` },
      },
      [createElement('path', {
        attrs: { d: linkPath },
      })],
    ));
    let startEmptyKey;
    let nodeBoxWidth = diagramWidth;
    let nodeBoxHeight = diagramHeight;
    switch (direction) {
      case 'l-r':
        nodeBoxHeight -= startEmptySpace;
        startEmptyKey = 'translateY';
        break;
      default:
        // t-b
        nodeBoxWidth -= startEmptySpace;
        startEmptyKey = 'translateX';
    }
    return createElement(
      'div',
      {
        staticClass: 'wrap',
        style: {
          width: `${nodeBoxWidth}px`,
          height: `${nodeBoxHeight}px`,
        },
      },
      [createElement(
        'div',
        {
          staticClass: 'node-box',
          style: {
            transform: `${startEmptyKey}(${-startEmptySpace}px)`,
          },
        },
        content,
      )],
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
