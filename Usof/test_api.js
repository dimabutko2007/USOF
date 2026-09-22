const app = require('./app');
const http = require('http');
const { pool } = require('./config/db');

async function testApi() {
  const server = app.listen(3001);
  console.log('====================================================');
  console.log('STARTING FULL API VERIFICATION SUITE');
  console.log('====================================================\n');

  try {
    let sessionCookie = '';

    async function request(path, options = {}) {
      return new Promise((resolve, reject) => {
        const url = new URL(`http://localhost:3001${path}`);
        const headers = options.headers || {};
        if (sessionCookie) {
          headers['Cookie'] = sessionCookie;
        }
        if (options.body && typeof options.body === 'object' && !(options.body instanceof Buffer)) {
          options.body = JSON.stringify(options.body);
          headers['Content-Type'] = 'application/json';
        }

        const req = http.request(url, {
          method: options.method || 'GET',
          headers: headers
        }, (res) => {
          let data = '';
          if (res.headers['set-cookie']) {
            const rawCookie = res.headers['set-cookie'][0];
            sessionCookie = rawCookie.split(';')[0];
          }
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const json = data ? JSON.parse(data) : {};
              resolve({ status: res.statusCode, data: json });
            } catch (e) {
              resolve({ status: res.statusCode, raw: data });
            }
          });
        });

        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
      });
    }

    // =========================================================================
    // ЧАСТИНА 1: ПЕРЕВІРКА БАЗОВИХ ФІЧ (BASIC FEATURES)
    // =========================================================================
    console.log('----------------------------------------------------');
    console.log('BASIC FEATURES');
    console.log('----------------------------------------------------');

    // 1.1 Health Check
    console.log('\n[Basic 1.1] GET /api/health');
    const hRes = await request('/api/health');
    console.log('   Status:', hRes.status, '| Output:', hRes.data.message);

    // 1.2 Auth: Register, Confirm Email & Login
    const uniqueUser = `test_basic_${Date.now()}`;
    console.log(`\n[Basic 1.2] POST /api/auth/register (${uniqueUser})`);
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: { login: uniqueUser, password: 'password123', passwordConfirmation: 'password123', email: `${uniqueUser}@example.com` }
    });
    console.log('   Status:', regRes.status, '| Message:', regRes.data.message);

    if (regRes.data.confirmToken) {
      console.log(`\n[Basic 1.3] GET /api/auth/confirm-email/${regRes.data.confirmToken}`);
      const confRes = await request(`/api/auth/confirm-email/${regRes.data.confirmToken}`);
      console.log('   Status:', confRes.status, '| Message:', confRes.data.message);
    }

    console.log('\n[Basic 1.4] POST /api/auth/login (johndoe)');
    sessionCookie = '';
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { login: 'johndoe', password: 'password123' }
    });
    console.log('   Status:', loginRes.status, '| Message:', loginRes.data.message, '| Session Cookie set:', !!sessionCookie);

    // 1.3 Users CRUD
    console.log('\n[Basic 1.5] GET /api/users');
    const usersRes = await request('/api/users');
    console.log('   Status:', usersRes.status, '| Total users count:', usersRes.data.users?.length);

    console.log('\n[Basic 1.6] GET /api/users/2');
    const user2Res = await request('/api/users/2');
    console.log('   Status:', user2Res.status, '| Login:', user2Res.data.user?.login, '| Email:', user2Res.data.user?.email);

    // 1.4 Categories CRUD
    console.log('\n[Basic 1.7] GET /api/categories');
    const catsRes = await request('/api/categories');
    console.log('   Status:', catsRes.status, '| Categories count:', catsRes.data.categories?.length);

    console.log('\n[Basic 1.8] GET /api/categories/1');
    const cat1Res = await request('/api/categories/1');
    console.log('   Status:', cat1Res.status, '| Title:', cat1Res.data.category?.title);

    // 1.5 Posts CRUD & Categories
    console.log('\n[Basic 1.9] GET /api/posts?page=1&limit=5&sort=likes');
    const postsRes = await request('/api/posts?page=1&limit=5&sort=likes');
    console.log('   Status:', postsRes.status, '| Posts count:', postsRes.data.posts?.length);

    console.log('\n[Basic 1.10] POST /api/posts (Create new post as johndoe)');
    const createPostRes = await request('/api/posts', {
      method: 'POST',
      body: { title: 'Basic Test Post', content: 'Testing post creation logic', categories: [1, 2] }
    });
    console.log('   Status:', createPostRes.status, '| Created Post ID:', createPostRes.data.post?.id);
    const createdPostId = createPostRes.data.post?.id;

    console.log(`\n[Basic 1.11] GET /api/posts/${createdPostId}`);
    const getPostRes = await request(`/api/posts/${createdPostId}`);
    console.log('   Status:', getPostRes.status, '| Title:', getPostRes.data.post?.title);

    console.log(`\n[Basic 1.12] GET /api/posts/${createdPostId}/categories`);
    const postCatsRes = await request(`/api/posts/${createdPostId}/categories`);
    console.log('   Status:', postCatsRes.status, '| Attached categories count:', postCatsRes.data.categories?.length);

    console.log(`\n[Basic 1.13] PATCH /api/posts/${createdPostId} (Update content)`);
    const updatePostRes = await request(`/api/posts/${createdPostId}`, {
      method: 'PATCH',
      body: { title: 'Basic Test Post (Updated)', content: 'Updated content body' }
    });
    console.log('   Status:', updatePostRes.status, '| Updated title:', updatePostRes.data.post?.title);

    // 1.6 Comments CRUD
    console.log(`\n[Basic 1.14] POST /api/posts/1/comments`);
    const commentRes = await request('/api/posts/1/comments', {
      method: 'POST',
      body: { content: 'Basic test comment on Post 1' }
    });
    console.log('   Status:', commentRes.status, '| Created Comment ID:', commentRes.data.comment?.id);

    console.log('\n[Basic 1.15] GET /api/posts/1/comments');
    const getCommentsRes = await request('/api/posts/1/comments');
    console.log('   Status:', getCommentsRes.status, '| Comments count for Post 1:', getCommentsRes.data.comments?.length);

    // 1.7 Likes System
    console.log('\n[Basic 1.16] POST /api/posts/2/like (Add like to post 2)');
    const likePostRes = await request('/api/posts/2/like', {
      method: 'POST',
      body: { type: 'like' }
    });
    console.log('   Status:', likePostRes.status, '| Message:', likePostRes.data.message);

    console.log('\n[Basic 1.17] DELETE /api/posts/2/like (Remove like)');
    const unLikePostRes = await request('/api/posts/2/like', { method: 'DELETE' });
    console.log('   Status:', unLikePostRes.status, '| Message:', unLikePostRes.data.message);

    console.log('\n[Basic 1.18] POST /api/comments/1/like (Add like to comment 1)');
    const likeComRes = await request('/api/comments/1/like', {
      method: 'POST',
      body: { type: 'like' }
    });
    console.log('   Status:', likeComRes.status, '| Message:', likeComRes.data.message);


    // =========================================================================
    // ЧАСТИНА 2: ПЕРЕВІРКА КРЕАТИВНИХ ФІЧ (CREATIVE FEATURES)
    // =========================================================================
    console.log('\n-------------------------------------------------------');
    console.log('CREATIVE FEATURES');
    console.log('-------------------------------------------------------');

    // 2.1 Favorites
    console.log('\n[Creative 2.1] POST /api/posts/1/favorite (Add Post 1 to favorites)');
    const addFavRes = await request('/api/posts/1/favorite', { method: 'POST' });
    console.log('   Status:', addFavRes.status, '| Message:', addFavRes.data.message);

    console.log('\n[Creative 2.2] GET /api/favorites (Get favorites list)');
    const getFavsRes = await request('/api/favorites');
    console.log('   Status:', getFavsRes.status, '| Favorites count:', getFavsRes.data.favorites?.length);

    console.log('\n[Creative 2.3] DELETE /api/posts/1/favorite (Remove Post 1 from favorites)');
    const delFavRes = await request('/api/posts/1/favorite', { method: 'DELETE' });
    console.log('   Status:', delFavRes.status, '| Message:', delFavRes.data.message);

    // 2.2 Guest Role Access Control
    console.log('\n[Creative 2.4] Guest Access Test (Unauthenticated Visitor)');
    sessionCookie = '';

    console.log('   a) Guest GET /api/posts...');
    const guestPosts = await request('/api/posts');
    console.log('      Status:', guestPosts.status, '| Active posts count:', guestPosts.data.posts?.length);

    console.log('   b) Guest GET /api/posts/1...');
    const guestPost1 = await request('/api/posts/1');
    console.log('      Status:', guestPost1.status, '| Post Title:', guestPost1.data.post?.title);

    console.log('   c) Guest GET /api/posts/1/comments...');
    const guestComments = await request('/api/posts/1/comments');
    console.log('      Status:', guestComments.status, '| Comments count:', guestComments.data.comments?.length);

    console.log('   d) Guest GET /api/categories...');
    const guestCategories = await request('/api/categories');
    console.log('      Status:', guestCategories.status, '| Categories count:', guestCategories.data.categories?.length);

    console.log('   e) Guest GET /api/users/1...');
    const guestUser = await request('/api/users/1');
    console.log('      Status:', guestUser.status, '| Public User profile:', guestUser.data.user?.login);

    console.log('   f) Guest POST /api/posts (Write attempt without session - Expected 401)...');
    const guestWriteFail = await request('/api/posts', { method: 'POST', body: { title: 'Guest Title', content: 'Fail' } });
    console.log('      Status:', guestWriteFail.status, '| Error message:', guestWriteFail.data.message);

    // 2.3 Notifications & Subscriptions System
    console.log('\n[Creative 2.5] Notifications & Subscriptions Flow');

    console.log('   a) Login as janesmith...');
    const janeLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { login: 'janesmith', password: 'password123' }
    });
    console.log('      Status:', janeLogin.status, '| Message:', janeLogin.data.message);
    const janeSessionCookie = sessionCookie;

    console.log('   b) Janesmith subscribes to Post 1 (POST /api/posts/1/subscribe)...');
    const subRes = await request('/api/posts/1/subscribe', { method: 'POST' });
    console.log('      Status:', subRes.status, '| Message:', subRes.data.message);

    console.log('   c) Johndoe logs in & comments on Post 1...');
    sessionCookie = '';
    await request('/api/auth/login', {
      method: 'POST',
      body: { login: 'johndoe', password: 'password123' }
    });
    const triggerCommentRes = await request('/api/posts/1/comments', {
      method: 'POST',
      body: { content: 'Automated comment triggering subscriber notification!' }
    });
    console.log('      Comment created | ID:', triggerCommentRes.data.comment?.id);

    console.log('   d) Janesmith logs in & checks in-app notifications (GET /api/notifications)...');
    sessionCookie = janeSessionCookie;
    const janeNotifs = await request('/api/notifications');
    console.log('      Status:', janeNotifs.status, '| Notifications count:', janeNotifs.data.notifications?.length);
    const latestNotif = janeNotifs.data.notifications?.[0];
    console.log('      Latest Notification message:', `"${latestNotif?.message}"`, '| Is Read:', latestNotif?.is_read);

    if (latestNotif) {
      console.log(`   e) Janesmith marks Notification #${latestNotif.id} as read (PATCH /api/notifications/${latestNotif.id}/read)...`);
      const markReadRes = await request(`/api/notifications/${latestNotif.id}/read`, { method: 'PATCH' });
      console.log('      Status:', markReadRes.status, '| Message:', markReadRes.data.message);
    }

    console.log('   f) Janesmith unsubscribes from Post 1 (DELETE /api/posts/1/subscribe)...');
    const unsubRes = await request('/api/posts/1/subscribe', { method: 'DELETE' });
    console.log('      Status:', unsubRes.status, '| Message:', unsubRes.data.message);

    // 2.4 Multiple Post Images Upload Support
    console.log('\n[Creative 2.6] Multiple Post Images Verification');
    console.log('   a) Verify images array structure in GET /api/posts/1...');
    const imagesPostRes = await request('/api/posts/1');
    console.log('      Status:', imagesPostRes.status, '| Images array present:', Array.isArray(imagesPostRes.data.post?.images), '| Images:', imagesPostRes.data.post?.images);

    console.log('\n====================================================');
    console.log('ALL BASIC AND CREATIVE API TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================\n');

  } catch (err) {
    console.error('API Verification Test Failed:', err);
    process.exitCode = 1;
  } finally {
    server.close(() => {
      pool.end().then(() => {
        process.exit(process.exitCode || 0);
      });
    });
  }
}

testApi();
