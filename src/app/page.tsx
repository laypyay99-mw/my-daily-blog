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
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [text, setText] = useState('');
  const [links, setLinks] = useState('');
  const [category, setCategory] = useState('Agriculture');
  const [posts, setPosts] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [open, setOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<Array<{ src: string }>>([]);

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

  const handleLogin = () => {
    const password = prompt("Enter admin password:");
    if (password === "1234") {
      setIsAdmin(true);
    } else {
      alert("Incorrect password.");
    }
  };

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

  const openLightbox = (urls: string[]) => {
    setLightboxImages(urls.map(url => ({ src: url })));
    setOpen(true);
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 py-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 text-center tracking-tight">My Daily Blog</h1>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-2xl mx-auto px-4">
          {isAdmin && (
            <div className="bg-white p-5 rounded-xl shadow-sm mb-8 border border-gray-200">
              <select
                className="w-full p-3 mb-3 text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Agriculture">Agriculture</option>
                <option value="Construction">Construction</option>
                <option value="Kids Gallery">Kids Gallery</option>
              </select>
              <textarea className="w-full p-4 border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base resize-none" placeholder="What's on your mind?" value={text} onChange={(e) => setText(e.target.value)} rows={4} />
              <input className="w-full p-3 text-sm border-t mt-3 border-gray-200" placeholder="Paste comma-separated image links..." value={links} onChange={(e) => setLinks(e.target.value)} />
              <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 font-semibold hover:bg-blue-700 transition-colors">Post</button>
            </div>
          )}

          <div className="mb-8">
            <input type="text" placeholder="Search posts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-4 rounded-full border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          
          <div className="mb-8 overflow-x-auto pb-4">
            <div className="flex space-x-3">
              {categories.map(cat => (
                  <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors whitespace-nowrap ${
                          filterCategory === cat
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                  >
                      {cat}
                  </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg text-gray-900">{post.author}</p>
                      {post.category && <p className="text-sm text-gray-500">{post.category}</p>}
                    </div>
                    <p className="text-sm text-gray-500 text-right">{formatDate(post.createdAt)}</p>
                  </div>
                  <p className="text-gray-800 my-4 text-base">{post.content}</p>
                </div>

                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="p-2">
                    <div className={`grid gap-2 ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                       {post.mediaUrls.map((url: string, index: number) => (
                           <div key={index} className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer" onClick={() => openLightbox(post.mediaUrls)}>
                               <img src={url} alt={`Post media ${index + 1}`} className="w-full h-full object-cover" />
                           </div>
                       ))}
                   </div>
                  </div>
                )}

                <div className="px-5 py-3 border-t border-gray-100">
                  <div className="flex justify-around items-center">
                    <button onClick={() => handleLike(post.id)} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Heart size={22} />
                      <span className="font-semibold">Like {post.likes > 0 && `(${post.likes})`}</span>
                    </button>
                    <button onClick={() => toggleComments(post.id)} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <MessageSquare size={22} />
                      <span className="font-semibold">Comment</span>
                    </button>
                    <button onClick={() => handleShare(post)} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Share2 size={22} />
                      <span className="font-semibold">Share</span>
                    </button>
                    {isAdmin && <button onClick={() => handleDelete(post.id)} className="flex items-center space-x-2 text-red-500 hover:text-red-700 transition-colors">
                      <Trash2 size={22} />
                      <span className="font-semibold">Delete</span>
                    </button>}
                  </div>
                </div>

                {showComments[post.id] && (
                  <div className="p-5 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3 mb-4">
                      <input type="text" value={commentText[post.id] || ''} onChange={e => setCommentText(prev => ({...prev, [post.id]: e.target.value}))} placeholder="Write a comment..." className="w-full p-3 border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500"/>
                      <button onClick={() => handleComment(post.id)} className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700">Send</button>
                    </div>
                    <div className="space-y-3">
                      {comments[post.id]?.map((comment, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-800">{comment.text}</p>
                          <p className="text-xs text-gray-500 mt-2 text-right">- {comment.author} at {formatDate(comment.createdAt)}</p>
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
      {!isAdmin && <div className="text-center py-4"><button onClick={handleLogin} className="text-xs text-gray-500 hover:underline">Login</button></div>}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={lightboxImages}
      />
    </div>
  );
}
