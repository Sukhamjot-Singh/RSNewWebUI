const m = require('mithril');
const rs = require('rswebui');

const GROUP_SUBSCRIBE_ADMIN          = 0x01;// means: you have the admin key for this group
const GROUP_SUBSCRIBE_PUBLISH        = 0x02;// means: you have the publish key for thiss group. Typical use: publish key in channels are shared with specific friends.
const GROUP_SUBSCRIBE_SUBSCRIBED     = 0x04;// means: you are subscribed to a group, which makes you a source for this group to your friend nodes.
const GROUP_SUBSCRIBE_NOT_SUBSCRIBED = 0x08;

const Data = {
  DisplayBoards: {},
};

async function updateDisplayBoards(keyid, details) {
  await rs
    .rsJsonApiRequest(
      '/rsposted/getBoardsInfo',
      {
        boardsIds: [keyid],
      },
      (data) => {
        details = data.boardsInfo[0];
        console.log(details);
      }
    )
    .then(() => {
      if (Data.DisplayBoards[keyid] === undefined) {
        Data.DisplayBoards[keyid] = {
          name: details.mMeta.mGroupName,
          isSearched: true,
          description: details.mDescription,
          image: details.mImage,
        };
      }
    });
  // console.log(Data.DisplayBoards[keyid]);
}
const DisplayBoardsFromList = () => {
  return {
    oninit: (v) => {},
    view: (v) =>
      m(
        'tr',
        {
          key: v.attrs.id,
          class:
            Data.DisplayBoards[v.attrs.id] && Data.DisplayBoards[v.attrs.id].isSearched
              ? ''
              : 'hidden',
          onclick: () => {
            m.route.set('/boards/:tab/:mGroupId', {
              tab: v.attrs.category,
              mGroupId: v.attrs.id,
            });
          },
        },
        [m('td', Data.DisplayBoards[v.attrs.id] ? Data.DisplayBoards[v.attrs.id].name : '')]
      ),
  };
};

const BoardSummary = () => {
  let keyid = {};
  return {
    oninit: (v) => {
      keyid = v.attrs.details.mGroupId;
      updateDisplayBoards(keyid);
    },

    view: (v) => {},
  };
};

const MessageView = () => {
  let cname = '';
  let cimage = '';
  return {
    oninit: (v) => {
      if (Data.DisplayBoards[v.attrs.id]) {
        cname = Data.DisplayBoards[v.attrs.id].name;
        cimage = Data.DisplayBoards[v.attrs.id].image;
      }
    },
    view: (v) =>
      m(
        '.widget',
        {
          key: v.attrs.id,
        },
        [
          m(
            'a[title=Back]',
            {
              onclick: () =>
                m.route.set('/boards/:tab', {
                  tab: m.route.param().tab,
                }),
            },
            m('i.fas.fa-arrow-left')
          ),
          m('h3', cname),
          m(
            'img.boardpic',
            {
              src: 'data:image/png;base64,' + cimage.mData.base64,
            }
          ),
          m('[id=boarddetails]', [
            m('p', m('b', 'Posts: '), 'posts'),
            m('p', m('b', 'Date created: '), '1/1/11'),
            m('p', m('b', 'Admin: '), 'name_of_admin'),
            m('p', m('b', 'Last activity: '), '1/1/11'),

          ]),
          // m('button', 'Reply'),
          // m('button', 'Reply All'),
          // m('button', 'Forward'),
          // m(
          //   'button',
          //   {
          //     onclick: () => {
          //       rs.rsJsonApiRequest('/rsMsgs/MessageToTrash', {
          //         msgId: details.msgId,
          //         bTrash: true,
          //       }),
          //         rs.rsJsonApiRequest('/rsMsgs/MessageDelete', {
          //           msgId: details.msgId,
          //         });
          //     },
          //   },
          //   'Delete'
          // ),
          m('hr'),
          m('boarddesc', m('b', 'Description: '), Data.DisplayBoards[v.attrs.id].description),
        ]
      ),
  };
};

const Table = () => {
  return {
    oninit: (v) => {},
    view: (v) => m('table.boards', [m('tr', [m('th', 'Board Name')]), v.children]),
  };
};
const SearchBar = () => {
  let searchString = '';
  return {
    view: (v) =>
      m('input[type=text][id=searchboard][placeholder=Search Subject].searchbar', {
        value: searchString,
        oninput: (e) => {
          searchString = e.target.value.toLowerCase();
          for (const hash in Data.DisplayBoards) {
            if (Data.DisplayBoards[hash].name.toLowerCase().indexOf(searchString) > -1) {
              Data.DisplayBoards[hash].isSearched = true;
            } else {
              Data.DisplayBoards[hash].isSearched = false;
            }
          }
        },
      }),
  };
};

module.exports = {
  SearchBar,
  BoardSummary,
  MessageView,
  DisplayBoardsFromList,
  Table,
  GROUP_SUBSCRIBE_ADMIN,
  GROUP_SUBSCRIBE_NOT_SUBSCRIBED,
  GROUP_SUBSCRIBE_PUBLISH,
  GROUP_SUBSCRIBE_SUBSCRIBED,
};
