'use client';
import { useState, useEffect } from 'react';
import { db } from '../firebase-client';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  increment,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { Heart, MessageSquare, Share2, UserCircle2, Trash2 } from 'lucide-react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const AddPostForm = () => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Art Gallery');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Art Gallery', 'My Plant Diary', 'School Projects'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Please write something in your diary.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        content,
        category,
        mediaUrls: imageUrl ? [imageUrl] : [],
        createdAt: new Date(),
        likes: 0,
        author: 'Admin',
      });
      setContent('');
      setCategory('Art Gallery');
      setImageUrl('');
      alert('Diary entry saved!');
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('Failed to save diary entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mb-10">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 font-serif mb-4">New Diary Entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-4 rounded-lg bg-gray-50 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-4"
                rows={4}
              />
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste ImgBB image URL (optional)"
                className="w-full p-4 rounded-lg bg-gray-50 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-4"
              />
              <div className="flex justify-between items-center">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="p-4 rounded-lg bg-gray-50 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 disabled:bg-blue-300 text-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 font-serif mb-4">Post Preview</h3>
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <UserCircle2 size={32} className="text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-800">Admin</p>
                        <p className="text-xs text-gray-500">{category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 text-right">Just now</p>
                  </div>
                  <p className="text-gray-700 my-4 text-base leading-relaxed">{content}</p>
                  {imageUrl && (
                    <div className="mt-4">
                      <img src={imageUrl} alt="Preview" className="w-full h-auto object-cover rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function DiaryPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [open, setOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<Array<{ src: string }>>([]);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});

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

  const handleLike = async (postId: string) => {
    const isLiked = !!likedPosts[postId];
    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    await updateDoc(doc(db, 'posts', postId), {
      likes: increment(isLiked ? -1 : 1)
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link Copied!');
  };

  const handleComment = async (postId: string) => {
    if (!commentText[postId]?.trim()) return;
    await addDoc(collection(db, 'posts', postId, 'comments'), { text: commentText[postId], author: 'Visitor', createdAt: new Date() });
    setCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleComments = (postId: string) => setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));

  const formatDate = (timestamp: any) => {
    if (timestamp instanceof Timestamp) return timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return null;
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
        alert('Post deleted successfully!');
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert('Failed to delete post.');
      }
    }
  };

  const filteredPosts = posts
    .filter(post => filterCategory === 'All' || post.category === filterCategory)
    .filter(post => post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase()));

  const categories = ['All', 'Art Gallery', 'My Plant Diary', 'School Projects'];

  const openLightbox = (urls: string[]) => {
    setLightboxImages(urls.map(url => ({ src: url })));
    setOpen(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className='max-w-4xl mx-auto px-4'>
        <header className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-800 font-serif">My Daily Diary</h1>
        </header>

        <main className="pb-8">
            <AddPostForm />
            <div className="mb-10">
              <input type="text" placeholder="Search diary entries..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-4 rounded-full bg-white border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>

            <div className="mb-10 flex justify-center">
              <div className="flex space-x-3 overflow-x-auto pb-4">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-5 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                            filterCategory === cat
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}>
                        {cat}
                    </button>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <UserCircle2 size={32} className="text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-800">Admin</p>
                          <p className="text-xs text-gray-500">{post.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="text-sm text-gray-500 text-right">{formatDate(post.createdAt)}</p>
                        <button onClick={() => handleDelete(post.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 my-4 text-base leading-relaxed">{post.content}</p>
                  </div>

                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                         {post.mediaUrls.map((url: string, index: number) => (
                             <div key={index} className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer" onClick={() => openLightbox(post.mediaUrls)}>
                                 <img src={url} alt={`Post media ${index + 1}`} className="w-full h-full object-cover aspect-square" />
                             </div>
                         ))}
                     </div>
                    </div>
                  )}

                  <div className="px-6 py-3 border-t border-gray-200">
                    <div className="flex justify-around items-center">
                      <button onClick={() => handleLike(post.id)} className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors font-medium">
                        <Heart size={22} className={`${likedPosts[post.id] ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                        <span className="font-semibold text-sm">Like {post.likes > 0 && `(${post.likes})`}</span>
                      </button>
                      <button onClick={() => toggleComments(post.id)} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors font-medium">
                        <MessageSquare size={22} />
                        <span className="font-semibold text-sm">Comment</span>
                      </button>
                      <button onClick={handleShare} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors font-medium">
                        <Share2 size={22} />
                        <span className="font-semibold text-sm">Share</span>
                      </button>
                    </div>
                  </div>

                  {showComments[post.id] && (
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center space-x-3 mb-4">
                        <input type="text" value={commentText[post.id] || ''} onChange={e => setCommentText(prev => ({...prev, [post.id]: e.target.value}))} placeholder="Write a comment..." className="w-full p-3 bg-white border-gray-200 rounded-full focus:ring-blue-500 focus:border-blue-500"/>
                        <button onClick={() => handleComment(post.id)} className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 text-sm">Send</button>
                      </div>
                      <div className="space-y-4">
                        {comments[post.id]?.map((comment, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-800">{comment.text}</p>
                            <p className="text-xs text-gray-500 mt-2 text-right">- {comment.author} on {formatDate(comment.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
        </main>
        <Lightbox
            open={open}
            close={() => setOpen(false)}
            slides={lightboxImages}
        />
      </div>
    </div>
  );
}
