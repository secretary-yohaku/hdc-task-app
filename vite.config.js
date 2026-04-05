import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      // 開発環境用: /api/chatwork をChatwork APIにプロキシ
      {
        name: 'chatwork-proxy',
        configureServer(server) {
          server.middlewares.use('/api/chatwork', async (req, res) => {
            const token = env.CHATWORK_API_TOKEN;
            const roomId = env.CHATWORK_ROOM_ID;

            if (!token || !roomId) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Chatwork設定がありません' }));
              return;
            }

            try {
              const response = await fetch(
                `https://api.chatwork.com/v2/rooms/${roomId}/messages?force=1`,
                { headers: { 'X-ChatWorkToken': token } }
              );

              const data = await response.text();
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = response.status;
              res.end(data);
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        },
      },
    ],
  };
});
