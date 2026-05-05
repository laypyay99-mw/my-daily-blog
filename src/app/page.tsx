'use client';
import { useState, useEffect } from 'react';
import { db } from './firebase-client';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
  increment,
  deleteDoc,
} from 'firebase/firestore';
import { Heart, MessageSquare, Share2, Trash2 } from 'lucide-react';

export default function Home() {
  const [text, setText] = useState('');
  const [links, setLinks] = useState('');
  const [category, setCategory] = useState('Agriculture');
  const [posts, setPosts] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);

      postsData.forEach(post => {
        if (!post.id) return;
        const commentsQuery = query(collection(db, 'posts', post.id, 'comments'), orderBy('createdAt', 'asc'));
        onSnapshot(commentsQuery, (commentsSnapshot) => {
          setComments(prev => ({ ...prev, [post.id]: commentsSnapshot.docs.map(doc => doc.data()) }));
        });
      });
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !links.trim()) {
      alert("Please enter some text or links to post.");
      return;
    }

    const mediaUrls = links.split(',').map(link => link.trim()).filter(link => link);

    try {
      await addDoc(collection(db, 'posts'), {
        author: 'Farm Owner',
        content: text,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : [],
        category: category,
        createdAt: serverTimestamp(),
        likes: 0,
      });
      setText('');
      setLinks('');
      setCategory('Agriculture');
      alert("Post successful!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to post. Please check console for details.");
    }
  };

  const handleLike = async (postId: string) => {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { likes: increment(1) });
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, 'posts', postId));
    }
  };

  const handleShare = async (post: any) => {
    const shareText = `${post.content} - from My Daily Blog`;
    if (navigator.share) {
      await navigator.share({ title: 'Check out this post!', text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Post content copied to clipboard!');
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentText[postId]?.trim()) return;
    await addDoc(collection(db, 'posts', postId, 'comments'), { text: commentText[postId], author: 'Visitor', createdAt: serverTimestamp() });
    setCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const formatDate = (timestamp: any) => {
    if (timestamp instanceof Timestamp) return timestamp.toDate().toLocaleString();
    return null;
  };

  const filteredPosts = posts
    .filter(post => {
      if (filterCategory === 'All') return true;
      return post.category === filterCategory;
    })
    .filter(post =>
      post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const categories = ['All', 'Agriculture', 'Construction', 'Kids Gallery'];

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="sticky top-0 bg-white shadow-md z-10 py-3">
        <div className="max-w-xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 text-center">My Daily Blog</h1>
        </div>
      </header>

      <main className="py-6">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white p-4 rounded-2xl shadow-md mb-6">
            <select
              className="w-full p-2 mb-2 text-sm border rounded-lg"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Agriculture">Agriculture (စိုက်ပျိုးရေး)</option>
              <option value="Construction">Construction (ဆောက်လုပ်ရေး)</option>
              <option value="Kids Gallery">Kids Gallery (ကလေးများ)</option>
            </select>
            <textarea className="w-full p-3 border-none focus:ring-0 text-lg resize-none" placeholder="What's on your mind?" value={text} onChange={(e) => setText(e.target.value)} rows={3} />
            <input className="w-full p-2 text-sm border-t mt-2" placeholder="Paste comma-separated image links..." value={links} onChange={(e) => setLinks(e.target.value)} />
            <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2.5 rounded-lg mt-3 font-semibold hover:bg-blue-700 transition-colors">Post</button>
          </div>

          <div className="mb-6">
            <input type="text" placeholder="Search posts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 rounded-2xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          
          <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                        filterCategory === cat
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {cat === 'Kids Gallery' ? 'Kids' : cat}
                </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{post.author}</p>
                      {post.category && <p className="text-xs text-gray-500">{post.category}</p>}
                    </div>
                    <p className="text-xs text-gray-500 text-right">{formatDate(post.createdAt)}</p>
                  </div>
                  <p className="text-gray-800 my-3">{post.content}</p>
                </div>

                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="p-4 pt-0">
                    <div className={`grid gap-2 ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                       {post.mediaUrls.map((url, index) => (
                           <div key={index} className="bg-gray-100 rounded-lg overflow-hidden">
                               <img src={url} alt={`Post media ${index + 1}`} className="w-full max-h-[400px] object-contain mx-auto" />
                           </div>
                       ))}
                   </div>
                  </div>
                )}

                <div className="p-2 border-t border-gray-100">
                  <div className="flex justify-around items-center">
                    <button onClick={() => handleLike(post.id)} className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 w-full justify-center py-2 rounded-lg transition-colors">
                      <Heart size={20} />
                      <span>Like {post.likes > 0 && `(${post.likes})`}</span>
                    </button>
                    <button onClick={() => toggleComments(post.id)} className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 w-full justify-center py-2 rounded-lg transition-colors">
                      <MessageSquare size={20} />
                      <span>Comment</span>
                    </button>
                    <button onClick={() => handleShare(post)} className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 w-full justify-center py-2 rounded-lg transition-colors">
                      <Share2 size={20} />
                      <span>Share</span>
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="flex items-center space-x-2 text-red-500 hover:bg-red-50 w-full justify-center py-2 rounded-lg transition-colors">
                      <Trash2 size={20} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {showComments[post.id] && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <input type="text" value={commentText[post.id] || ''} onChange={e => setCommentText(prev => ({...prev, [post.id]: e.target.value}))} placeholder="Write a comment..." className="w-full p-2 border rounded-lg"/>
                      <button onClick={() => handleComment(post.id)} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Send</button>
                    </div>
                    <div className="space-y-2">
                      {comments[post.id]?.map((comment, index) => (
                        <div key={index} className="bg-gray-100 p-2 rounded-lg">
                          <p className="text-sm text-gray-800">{comment.text}</p>
                          <p className="text-xs text-gray-500 mt-1 text-right">- {comment.author} at {formatDate(comment.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
