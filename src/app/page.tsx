''''use client';
import { useState, useEffect } from 'react';
import { db } from './firebase-client';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  increment,
  addDoc
} from 'firebase/firestore';
import { Heart, MessageSquare, Share2, UserCircle2 } from 'lucide-react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function Home() {
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

  const filteredPosts = posts
    .filter(post => filterCategory === 'All' || post.category === filterCategory)
    .filter(post => post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase()));

  const categories = ['All', 'Agriculture', 'Construction', 'Kids Gallery'];

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
                      <p className="text-sm text-gray-500 text-right">{formatDate(post.createdAt)}</p>
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
'''