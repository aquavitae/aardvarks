const getTokenOwner = (token) =>
  Object.keys(token.actor.ownership)
    .filter((id) => token.actor.ownership[id] === 3)
    .map((id) => game.users.get(id).name);

Hooks.on('chatCommandsReady', (commands) => {
  const cmd = commands.commands.get('/whisper');
  if (cmd) {
    cmd.description = 'Send a private message to another player. This will also be visible to the GM.';
    cmd.callback = (_, parameters, metadata) => {
      if (metadata.speaker.alias === 'Gamemaster') {
        return null;
      }

      const m = parameters.match(/^(?:\[(.*?)\])(.*)/) || parameters.match(/^(.*?) (.*)/);
      if (!m) {
        return {};
      }

      const targets = m[1];
      const message = m[2];

      if (targets.match(/\b(gamemaster|gm)\b/i)) {
        return null;
      }

      ui.chat.processMessage(`/whisper [Gamemaster, ${targets}] ${message}`);

      return {};
    };
    commands.register(cmd);
  }
});

Hooks.on('chatCommandsReady', (commands) => {
  commands.register({
    name: '/t',
    module: 'aardvarks',
    aliases: ['%'],
    description: 'Whisper to the targeted tokens. This will also be visible to the GM',
    icon: "<i class='fas fa-message'></i>",
    requiredRole: 'NONE',
    callback: (_, message) => {
      const whisperTargets = Array.from(game.user.targets)
        .flatMap((x) => getTokenOwner(x))
        .filter((x) => x !== 'Gamemaster');

      const targetNames = Array.from(game.user.targets)
        .map((x) => x.name)
        .sort()
        .join(', ');

      if (targetNames.length === 0) {
        return {};
      }
      const targets = Array.from(new Set([...whisperTargets])).join(', ');

      const m = `<small><strong>To: <em>${targetNames}</em></strong></small><br/>${message}`;
      ui.chat.processMessage(`/whisper [${targets}] ${m}`);

      return {};
    },
  });
});
