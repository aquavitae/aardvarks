Hooks.on('chatCommandsReady', (commands) => {
  const cmd = commands.commands.get('/whisper');
  if (cmd) {
    cmd.description = 'Send a private message to another player. This will also be visible to the GM.';
    cmd.callback = (_, parameters) => {
      const m = parameters.match(/^(?:\[(.*?)\])(.*)/) || parameters.match(/^(.*?) (.*)/);
      if (m && !m[1].match(/\bGM\b/)) {
        const users = `GM, ${m[1]}`;
        const message = m[2];
        ui.chat.processMessage(`/whisper [${users}] ${message}`);
        return {};
      }
      return null;
    };
    commands.register(cmd);
  }
});
