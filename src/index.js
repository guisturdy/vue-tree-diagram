import TreeDiagram from './component/TreeDiagram.vue';

TreeDiagram.install = function install(Vue) {
  Vue.component('TreeDiagram', TreeDiagram);
};

export { TreeDiagram };

export default TreeDiagram;
