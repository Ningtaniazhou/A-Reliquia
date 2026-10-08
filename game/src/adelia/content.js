export const start="introduction";
export const nodes={
  introduction:{id:'ADE-introduction',speaker:'特奥多里科 · 回忆',text:'西尔维里奥，绰号“林尚”，是我在科英布拉的同窗，也是以前的室友。我是在一个下着细雨的傍晚，经由他认识阿德里娅的。他带我去了萨里特雷一栋粉色的房子。那一晚，我坐到阿德里娅身边，连雨伞都忘了放下。后来，我们成了情人。\n\n现在总算离开姨姨的目光了，我要去阿德里娅家，和她一起吃晚饭。',next:'arrival',scene:'narration',kind:'A',page:'93–95、108–109'},
  "arrival": {
    "id": "ADE-arrival",
    "speaker": "阿德里娅",
    "text": "在姨姨那里，又只喝了清水？",
    "next": "sinner",
    "scene": "supper",
    "kind": "A",
    "page": "108–109"
  },
  "sinner": {
    "id": "ADE-sinner",
    "speaker": "特奥多里科",
    "text": "面包和清水留在那边吧。今晚，别让我再做圣人了。",
    "next": "umbrella",
    "scene": "supper",
    "kind": "A",
    "page": "103、108–109"
  },
  "umbrella": {
    "id": "ADE-umbrella",
    "speaker": "阿德里娅",
    "text": "还记得初次见面吗？你连雨伞都舍不得放到一旁。",
    "next": null,
    "scene": "supper",
    "kind": "A",
    "page": "94",
    "choices": [
      {
        "id": "close",
        "text": "我舍不得离开你身边，哪怕一小会儿。",
        "next": "close"
      },
      {
        "id": "shy",
        "text": "那时我紧张得，连雨伞都忘了。",
        "next": "shy"
      }
    ]
  },
  "close": {
    "id": "ADE-close",
    "speaker": "特奥多里科",
    "text": "我是不愿离开你身边，哪怕只是一小会儿。",
    "next": "close_reply",
    "scene": "supper",
    "kind": "T",
    "page": "94",
    "pt": "É para não me tirar daqui de ao pé da menina nem um instantinho que seja."
  },
  "close_reply": {
    "id": "ADE-close_reply",
    "speaker": "阿德里娅",
    "text": "那么今晚，也不许你坐得那么远。",
    "next": "wealth",
    "scene": "supper",
    "kind": "O",
    "page": null
  },
  "shy": {
    "id": "ADE-shy",
    "speaker": "特奥多里科",
    "text": "那时我紧张得，连雨伞都忘了。",
    "next": "shy_reply",
    "scene": "supper",
    "kind": "O",
    "page": null
  },
  "shy_reply": {
    "id": "ADE-shy_reply",
    "speaker": "阿德里娅",
    "text": "如今嘴倒甜了。可别又只顾着发愣。",
    "next": "wealth",
    "scene": "supper",
    "kind": "O",
    "page": null
  },
  "wealth": {
    "id": "ADE-wealth",
    "speaker": "阿德里娅",
    "text": "你总说姨姨有房产、有银器。若真拿到那些钱，还会记得我吗？",
    "next": null,
    "scene": "supper",
    "kind": "A",
    "page": "99",
    "choices": [
      {
        "id": "house",
        "text": "姨姨一咽气，我就给你置办一所漂亮房子。",
        "next": "house"
      },
      {
        "id": "vow",
        "text": "钱是她的；我的心可早就在你这里。",
        "next": "vow"
      }
    ]
  },
  "house": {
    "id": "ADE-house",
    "speaker": "特奥多里科",
    "text": "要是姨姨现在一咽气，我就给你置办一所时髦的房子！",
    "next": "house_reply",
    "scene": "supper",
    "kind": "T",
    "page": "99",
    "pt": "Se a titi agora rebentasse, eu é que lhe punha à menina uma casa chic!"
  },
  "house_reply": {
    "id": "ADE-house_reply",
    "speaker": "阿德里娅",
    "text": "得了吧！你若真拿到钱，就不会再理我了！",
    "next": "leaving",
    "scene": "supper",
    "kind": "T",
    "page": "99",
    "pt": "Ora! O cavalheiro, se apanhasse o bago, não se importava mais comigo!"
  },
  "vow": {
    "id": "ADE-vow",
    "speaker": "特奥多里科",
    "text": "钱是她的；我的心可早就在你这里。",
    "next": "vow_reply",
    "scene": "supper",
    "kind": "O",
    "page": null
  },
  "vow_reply": {
    "id": "ADE-vow_reply",
    "version": 7,
    "speaker": "阿德里娅",
    "text": "好听的话你倒不少。等真拿到了钱，可别又舍不得花在我身上。",
    "next": "leaving",
    "scene": "supper",
    "kind": "O",
    "page": null
  },
  "farewell": {
    "id": "ADE-farewell",
    "speaker": "阿德里娅",
    "text": "裹暖些，亲爱的！",
    "next": "bridge",
    "scene": "supper",
    "kind": "T",
    "page": "100",
    "pt": "Agasalha-te, riquinho!"
  },
  "who": {
    "id": "ADE-who",
    "speaker": "阿德里娅 · 窗口",
    "text": "谁这么粗鲁？",
    "next": "open",
    "scene": "door",
    "kind": "T",
    "page": "115",
    "pt": "Quem é o bruto?"
  },
  "open": {
    "id": "ADE-open",
    "speaker": "特奥多里科",
    "text": "是我。开门。",
    "next": "refusal",
    "scene": "door",
    "kind": "T",
    "page": "115",
    "pt": "Sou eu, abre."
  },
  "refusal": {
    "id": "ADE-refusal",
    "speaker": "阿德里娅 · 窗口",
    "text": "不能开门，我晚饭吃得迟，现在困了！",
    "next": "threat",
    "scene": "door",
    "kind": "T",
    "page": "115",
    "pt": "Não posso abrir, que ceei tarde e estou com sono!"
  },
  "threat": {
    "id": "ADE-threat",
    "speaker": "特奥多里科",
    "text": "开门！不然我再也不来了！",
    "next": "dismiss",
    "scene": "door",
    "kind": "T",
    "page": "115",
    "pt": "Abre ou nunca mais cá volto!…"
  },
  "dismiss": {
    "id": "ADE-dismiss",
    "speaker": "阿德里娅 · 窗口",
    "text": "那就拉倒吧，替我问候你姨姨。",
    "next": null,
    "scene": "door",
    "kind": "T",
    "page": "115",
    "pt": "Pois à fava, e recados à tia."
  },
  "leaving": {
    "id": "ADE-leaving",
    "speaker": "特奥多里科",
    "text": "已经这么晚了，我得回去了。再舍不得，也不能让姨姨发现。",
    "next": "coat",
    "scene": "supper",
    "kind": "O",
    "page": null,
    "note": "补足离席语境的原创衔接对白。"
  },
  "coat": {
    "id": "ADE-coat",
    "speaker": "阿德里娅",
    "text": "那就把外套穿好，别只顾着回头看我。",
    "next": "farewell",
    "scene": "supper",
    "kind": "O",
    "page": null
  },
  "bridge": {
    "id": "ADE-bridge",
    "speaker": "",
    "text": "几个月过去，阿德里娅对我渐渐冷淡。七月，她又亲热起来，向我要了八镑。我借神的名义编了个谎，把钱弄来。几天后，刚和她吵过架的女仆告诉我：那个被她称作“外甥”的阿德利诺，其实是她的情人；我的钱给那人买了新衣，还供他们一同出游。当夜一点过后，我来到阿德里娅的门前。",
    "next": "who",
    "scene": "narration",
    "kind": "A",
    "page": "110–115",
    "note": "单屏旁白压缩数月过程。有关情人身份与钱款用途保留女仆转述来源；不以全知口吻确认。无分支，仅阅读后继续。"
  }
};
export const sourceNote="阿德里娅段依据 IN-CM 2021 p.94、99–100、108–115，跨时期重组。两组选项改变当下回应；离席前两句为原创衔接。黑屏旁白压缩数月过程，情人身份与八镑用途由女仆转述。以门外最后一句拒绝结束。";
