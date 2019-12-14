<template>
  <div class="wrap">
    <tree-diagram
      :data="data"
      :node-pad="3"
      :level-pad="20"
      :direction="'t-b'"
      :align="'start'"
      @before-render-node="beforeRenderTree"
      @after-render-node="afterRenderTree"
      @node-click="handleNodeClick"
    >
      <template v-slot:type-root="{value}">
        <div class="root-type-class">
          <div>{{value.title}}</div>
          <div class="en-title">{{value.enName}}</div>
        </div>
      </template>
      <template v-slot:default="{value, type}">
        <div :class="type">
          <div>{{value.title}}</div>
          <div class="en-title">{{value.enName}}</div>
        </div>
      </template>
    </tree-diagram>
  </div>
</template>

<script>
/* eslint-disable no-console */
import TreeDiagram from 'TreeDiagram';

export default {
  data() {
    return {
      data: [],
    };
  },
  components: { TreeDiagram },
  methods: {
    handleNodeClick(node, event) {
      console.log(node, event);
    },
    beforeRenderTree() {
      console.log('beforeRenderTree');
    },
    afterRenderTree() {
      console.log('afterRenderTree');
    },
  },
  mounted() {
    this.data = [
      {
        id: 'root',
        type: 'type-root',
        value: { title: '哈利·波特中的生物', enName: 'Magical creatures in Harry Potter' },
        children: [

          {
            id: 41,
            type: 'type-3',
            value: { title: '卢娜·洛夫古德的魔法生物', enName: "Luna Lovegood's creatures" },
            children: [
              { id: 42, type: 'type-3-c', value: { title: '八宝兽', enName: 'Blibbering Humdinger' } },
              { id: 43, type: 'type-3-c', value: { title: '犄角兽', enName: 'Crumple-Horned Snorkack' } },
              { id: 44, type: 'type-3-c', value: { title: '毒角兽角', enName: 'Erumpent horn' } },
              { id: 45, type: 'type-3-c', value: { title: '淡水彩球鱼', enName: 'Freshwater Plimpies' } },
              { id: 46, type: 'type-3-c', value: { title: '太阳霸', enName: 'Heliopaths' } },
              { id: 47, type: 'type-3-c', value: { title: '水烟虫', enName: 'Nargles' } },
              { id: 48, type: 'type-3-c', value: { title: '大嘴彩球鱼', enName: 'Gulping Plimpy' } }],
          },
          {
            id: 2,
            type: 'type-1',
            value: { title: '灵魂分部', enName: 'Spirits' },
            children: [
              { id: 3, type: 'type-1-c', value: { title: '鬼魂', enName: 'Ghost' } },
              { id: 4, type: 'type-1-c', value: { title: '骚灵', enName: 'Poltergeist' } }],
          },
          {
            id: 6,
            type: 'type-2',
            value: { title: '怪兽分部', enName: 'Creatures' },
            children: [
              { id: 7, type: 'type-2-c', value: { title: '咬人仙子', enName: 'Biting Fairy' } },
              { id: 8, type: 'type-2-c', value: { title: '狐媚子', enName: 'Doxy' } },
              {
                id: 10,
                type: 'type-2-c',
                value: { title: '龙', enName: 'Dragon' },
                children: [
                  { id: 11, type: 'type-2-c', value: { title: '澳洲蛋白眼龙', enName: 'Antipodean Opaleye' } },
                  { id: 12, type: 'type-2-c', value: { title: '中国火球龙', enName: 'Chinese Fireball' } },
                  { id: 13, type: 'type-2-c', value: { title: '威尔士共同区绿龙', enName: 'Common Welsh Green' } },
                  { id: 14, type: 'type-2-c', value: { title: '布里底黑龙', enName: 'Hebridean Black' } },
                  { id: 15, type: 'type-2-c', value: { title: '匈牙利角尾龙', enName: 'Hungarian Horntail' } },
                  { id: 16, type: 'type-2-c', value: { title: '挪威脊背龙', enName: 'Norwegian Ridgeback' } },
                  { id: 17, type: 'type-2-c', value: { title: '罗马尼亚长角龙', enName: 'Romanian Longhorn' } },
                  { id: 18, type: 'type-2-c', value: { title: '秘鲁毒牙龙', enName: 'Peruvian Vipertooth' } },
                  { id: 19, type: 'type-2-c', value: { title: '瑞典短吻龙', enName: 'Swedish Short-Snout' } },
                  { id: 20, type: 'type-2-c', value: { title: '乌克兰铁腹龙', enName: 'Ukrainian Ironbelly' } }],
              },
              { id: 21, type: 'type-2-c', value: { title: '狮鹫', enName: 'Griffin' } },
              { id: 22, type: 'type-2-c', value: { title: '小恶魔', enName: 'Imp' } },
              { id: 23, type: 'type-2-c', value: { title: '咬人仙子', enName: 'Biting Fairy' } },
              { id: 24, type: 'type-2-c', value: { title: '鹰头马身有翼兽', enName: 'Hippogriff' } },
              { id: 25, type: 'type-2-c', value: { title: '凤凰', enName: 'Phoenix' } },
              {
                id: 27,
                type: 'type-2-c',
                value: { title: '食尸鬼', enName: 'Ghoul' },
                children: [
                  { id: 28, type: 'type-2-c', value: { title: '变色龙食尸鬼', enName: 'Chameleon Ghoul' } }],
              },
              { id: 29, type: 'type-2-c', value: { title: '炸尾螺', enName: 'Blast-Ended Skrewt' } },
              { id: 30, type: 'type-2-c', value: { title: '幻影猿', enName: 'Demiguise' } },
              { id: 31, type: 'type-2-c', value: { title: '客迈拉兽', enName: 'Chimaera' } },
              {
                id: 33,
                type: 'type-2-c',
                value: { title: '天马', enName: 'Winged Horse' },
                children: [
                  { id: 34, type: 'type-2-c', value: { title: '神符马', enName: 'Abraxan' } },
                  { id: 35, type: 'type-2-c', value: { title: '伊瑟龙', enName: 'Aethonan' } },
                  { id: 36, type: 'type-2-c', value: { title: '格拉灵', enName: 'Granian' } },
                  { id: 37, type: 'type-2-c', value: { title: '夜骐', enName: 'Thestral' } }],
              },
              { id: 38, type: 'type-2-c', value: { title: '木精', enName: 'Bowtruckle' } },
              { id: 39, type: 'type-2-c', value: { title: '独角兽', enName: 'Unicorn' } }],
          },
          {
            id: 50,
            type: 'type-4',
            value: { title: '未能分类', enName: 'Status unknown' },
            children: [
              { id: 51, type: 'type-4-c', value: { title: '报丧女妖', enName: 'Banshee' } },
              { id: 52, type: 'type-4-c', value: { title: '双角兽角', enName: 'Bicorn' } },
              {
                id: 58,
                type: 'type-4-c',
                value: { title: '媚娃', enName: 'Veela' },
                children: [
                  { id: 59, type: 'type-4-c', value: { title: '混血媚娃', enName: 'Half-Veela' } }],
              },
              { id: 53, type: 'type-4-c', value: { title: '蛇鸡兽', enName: 'Cockatrice' } },
              { id: 54, type: 'type-4-c', value: { title: '矮人', enName: 'Dwarf' } },
              { id: 55, type: 'type-4-c', value: { title: '食人魔', enName: 'Ogres' } },
              { id: 56, type: 'type-4-c', value: { title: '三头巨犬', enName: 'Three-headed dogs' } },
              { id: 60, type: 'type-4-c', value: { title: '山林仙女', enName: 'Wood Nymph' } }],
          }],
      }];
  },
  watch: {},
  computed: {},
  props: {},
};
</script>

<style scoped>
@font-face {
  font-family: "harrypotter";
  src: url("./harrypotter.ttf");
}
.en-title {
  font-family: "harrypotter";
  letter-spacing: 1.5px;
  line-height: 1.5;
}
.type-1-c,
.type-1 {
  background: #71b77b;
  color: #333;
  border-radius: 2px;
  border-bottom: 3px solid #a3f3a8;
}
.type-2-c,
.type-2 {
  background: #215a7b;
  color: #fff;
  border-radius: 2px;
  border-bottom: 3px solid #57a9db;
}
.type-3-c,
.type-3 {
  background: #611711;
  color: #fff;
  border-radius: 2px;
  border-bottom: 3px solid yellow;
}
.type-4-c,
.type-4 {
  background: #919396;
  color: #e6e3d3;
  border-radius: 2px;
  border-bottom: 3px solid #fff;
}
.root-type-class {
  font-size: 30px;
  color: #f7c033;
  text-shadow: -1px -1px 1px #b99025;
}
.root-type-class,
.type-1,
.type-2,
.type-3,
.type-4 {
  padding: 1em 3em 0.5em 3em;
  font-family: "Times New Roman", Times, serif;
  font-size: 18px;
  line-height: 1;
  text-align: center;
  font-weight: bold;
}
.type-1-c,
.type-2-c,
.type-3-c,
.type-4-c {
  font-family: "Times New Roman", Times, serif;
  white-space: normal;
  writing-mode: vertical-lr;
  padding: 1em 0 1em 0.5em;
  font-weight: bold;
}

div/deep/ path {
  fill: transparent;
  stroke: #b99025;
  stroke-width: 1px;
  opacity: 0.5;
}
div/deep/ .path-type-1-c,
div/deep/ .path-type-1 {
  stroke: #a3f3a8;
}
div/deep/ .path-type-2-c,
div/deep/ .path-type-2 {
  stroke: #57a9db;
}
div/deep/ .path-type-3-c,
div/deep/ .path-type-3 {
  stroke: yellow;
}
div/deep/ .path-type-4-c,
div/deep/ .path-type-4 {
  stroke: #fff;
}
.wrap {
  transform-origin: left top;
  background: #232532;
  display: inline-block;
  padding: 1em;
  border-radius: 4px;
}
</style>
