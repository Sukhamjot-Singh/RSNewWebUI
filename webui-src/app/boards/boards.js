const m = require('mithril');
const widget = require('widgets');
const rs = require('rswebui');
const util = require('boards/boards_util');

const getBoards =
{
  All : [],
  PopularBoards : [],
  SubscribedBoards : [],
  load(){

    rs.rsJsonApiRequest('/rsposted/getBoardsSummaries', {}, (data) => {
      getBoards.All = data.boards;

      getBoards.PopularBoards = getBoards.All;
      // console.log(util.GROUP_SUBSCRIBE_SUBSCRIBED === 4);
      getBoards.SubscribedBoards = getBoards.All.filter(
        (board) => (board.mSubscribeFlags) === util.GROUP_SUBSCRIBE_SUBSCRIBED
      );
    });
  }
};

const sections = {
  MyBoards: require('boards/my_boards'),
  SubscribedBoards: require('boards/subscribed_boards'),
  PopularBoards: require('boards/popular_boards'),
  OtherBoards: require('boards/other_boards')
};

const Layout = {
  oninit: getBoards.load,
  view: (vnode) =>
    m('.tab-page', [
      m(util.SearchBar, {
        list: getBoards.All
      }),
      m(widget.Sidebar, {
        tabs: Object.keys(sections),
        baseRoute: '/boards/',
      }),
      m('.board-node-panel', vnode.children),
    ]),
};

module.exports = {
  view: (vnode) => {
    const tab = vnode.attrs.tab;
    if (Object.prototype.hasOwnProperty.call(vnode.attrs, 'mGroupId')) {
      return m(
        Layout,
        m(util.MessageView, {
          id: vnode.attrs.mGroupId,
        })
      );
    }
    return m(
      Layout,
      m((sections[tab]), {
      list: getBoards[tab],
      }),
    );
  },
};
