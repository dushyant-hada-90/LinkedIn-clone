import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Search, ArrowLeft, MessageCircle, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from '../context/SessionContext';
import { useSocket } from '../context/SocketContext';
import { messagesApi, connectionsApi } from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Avatar } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import type { Conversation, Message, User } from '../types';

export default function MessagesPage() {
  const { conversationId: activeConvoId } = useParams<{ conversationId: string }>();
  const { user: me } = useSession();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [connections, setConnections] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Get the other participant from a conversation
  const getOther = useCallback(
    (convo: Conversation): User | undefined => {
      return convo.participants.find((p) => p._id !== me?._id);
    },
    [me?._id],
  );

  // Fetch conversations
  useEffect(() => {
    messagesApi
      .getConversations()
      .then((res) => setConversations(res.data))
      .catch(() => {})
      .finally(() => setLoadingConvos(false));

    connectionsApi
      .myConnections()
      .then((res) => setConnections(res.data))
      .catch(() => {});
  }, []);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConvoId) {
      setMessages([]);
      return;
    }
    setLoadingMsgs(true);
    messagesApi
      .getMessages(activeConvoId)
      .then((res) => {
        setMessages(res.data);
        // mark as read
        messagesApi.markRead(activeConvoId).catch(() => {});
        if (socket) socket.emit('mark_read', { conversationId: activeConvoId });
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  }, [activeConvoId, socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (data: { message: Message; conversationId: string }) => {
      if (data.conversationId === activeConvoId) {
        setMessages((prev) => [...prev, data.message]);
        messagesApi.markRead(data.conversationId).catch(() => {});
        socket.emit('mark_read', { conversationId: data.conversationId });
      }
      // Update conversation list
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === data.conversationId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            lastMessage: data.message.content,
            lastMessageAt: data.message.createdAt,
          };
          // Move to top
          const [item] = updated.splice(idx, 1);
          updated.unshift(item);
          return updated;
        }
        // New conversation — refetch
        messagesApi.getConversations().then((res) => setConversations(res.data)).catch(() => {});
        return prev;
      });
    };

    const onMessageSent = (data: { message: Message; conversationId: string }) => {
      if (data.conversationId === activeConvoId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }
      // Update conversation list
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === data.conversationId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            lastMessage: data.message.content,
            lastMessageAt: data.message.createdAt,
          };
          const [item] = updated.splice(idx, 1);
          updated.unshift(item);
          return updated;
        }
        messagesApi.getConversations().then((res) => setConversations(res.data)).catch(() => {});
        return prev;
      });
    };

    const onUserTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConvoId && data.userId !== me?._id) {
        setTyping(data.userId);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(null), 2500);
      }
    };

    socket.on('new_message', onNewMessage);
    socket.on('message_sent', onMessageSent);
    socket.on('user_typing', onUserTyping);

    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('message_sent', onMessageSent);
      socket.off('user_typing', onUserTyping);
    };
  }, [socket, activeConvoId, me?._id]);

  const sendMessage = async () => {
    if (!msgText.trim() || !activeConvoId) return;
    const text = msgText.trim();
    setMsgText('');
    setSending(true);

    // Find receiver
    const convo = conversations.find((c) => c._id === activeConvoId);
    const other = convo ? getOther(convo) : null;

    if (socket && other) {
      socket.emit('send_message', { receiverId: other._id, content: text });
    } else if (other) {
      try {
        await messagesApi.sendMessage(other._id, text);
        // Refetch
        const res = await messagesApi.getMessages(activeConvoId);
        setMessages(res.data);
      } catch {
        // ignore
      }
    }
    setSending(false);
  };

  const startNewChat = async (userId: string) => {
    try {
      // Send a hello message to start the conversation
      const res = await messagesApi.sendMessage(userId, 'Hey! 👋');
      const convosRes = await messagesApi.getConversations();
      setConversations(convosRes.data);
      // Navigate to the new conversation
      const newConvo = convosRes.data.find((c) =>
        c.participants.some((p) => p._id === userId),
      );
      if (newConvo) navigate(`/messages/${newConvo._id}`);
    } catch {
      // ignore
    }
  };

  const handleTypingInput = (value: string) => {
    setMsgText(value);
    if (socket && activeConvoId) {
      const convo = conversations.find((c) => c._id === activeConvoId);
      const other = convo ? getOther(convo) : null;
      if (other) {
        socket.emit('typing', { conversationId: activeConvoId, receiverId: other._id });
      }
    }
  };

  // Active conversation data
  const activeConvo = conversations.find((c) => c._id === activeConvoId);
  const activeOther = activeConvo ? getOther(activeConvo) : null;

  // Filter connections for new chat (exclude ones with existing conversations)
  const filteredConnections = connections.filter((c) => {
    const hasConvo = conversations.some((conv) =>
      conv.participants.some((p) => p._id === c._id),
    );
    if (search) {
      const q = search.toLowerCase();
      const name = `${c.firstName} ${c.lastName}`.toLowerCase();
      return name.includes(q) && !hasConvo;
    }
    return !hasConvo;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4 h-[calc(100vh-8rem)]">
          {/* Conversation List (sidebar) */}
          <Card className={`flex flex-col overflow-hidden ${activeConvoId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-lg mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConvos ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-11 w-11 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Existing Conversations */}
                  {conversations
                    .filter((c) => {
                      if (!search) return true;
                      const other = getOther(c);
                      const name = `${other?.firstName} ${other?.lastName}`.toLowerCase();
                      return name.includes(search.toLowerCase());
                    })
                    .map((convo) => {
                      const other = getOther(convo);
                      const isActive = convo._id === activeConvoId;
                      return (
                        <button
                          key={convo._id}
                          onClick={() => navigate(`/messages/${convo._id}`)}
                          className={`flex items-center gap-3 w-full p-3.5 text-left transition-colors hover:bg-accent ${
                            isActive ? 'bg-accent border-l-2 border-primary' : ''
                          }`}
                        >
                          <Avatar
                            src={other?.profileImage}
                            fallback={(other?.firstName || '?')[0]}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold truncate">
                                {other?.firstName} {other?.lastName}
                              </p>
                              <span className="text-[10px] text-muted shrink-0 ml-2">
                                {convo.lastMessageAt
                                  ? formatDistanceToNow(new Date(convo.lastMessageAt), { addSuffix: false })
                                  : ''}
                              </span>
                            </div>
                            <p className="text-xs text-muted truncate mt-0.5">
                              {convo.lastMessage || 'Start chatting'}
                            </p>
                          </div>
                        </button>
                      );
                    })}

                  {/* Start new chat */}
                  {filteredConnections.length > 0 && (
                    <div className="px-3 pt-4 pb-2">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Start a chat
                      </p>
                      {filteredConnections.slice(0, 10).map((c) => (
                        <button
                          key={c._id}
                          onClick={() => startNewChat(c._id)}
                          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                          <Avatar src={c.profileImage} fallback={(c.firstName || '?')[0]} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {c.firstName} {c.lastName}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {conversations.length === 0 && filteredConnections.length === 0 && (
                    <div className="flex flex-col items-center py-10 px-4 text-center">
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <MessageCircle className="h-7 w-7 text-primary" />
                      </div>
                      <p className="font-semibold">No messages yet</p>
                      <p className="text-sm text-muted mt-1">Connect with people to start chatting</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Chat Panel */}
          <Card className={`flex flex-col overflow-hidden ${!activeConvoId ? 'hidden md:flex' : 'flex'}`}>
            {!activeConvoId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Your Messages</h3>
                <p className="text-sm text-muted max-w-xs">
                  Select a conversation from the sidebar or start a new chat with a connection
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <button
                    onClick={() => navigate('/messages')}
                    className="md:hidden p-1 rounded-lg hover:bg-accent"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  {activeOther && (
                    <>
                      <button onClick={() => navigate(`/profile/${activeOther._id}`)}>
                        <Avatar
                          src={activeOther.profileImage}
                          fallback={(activeOther.firstName || '?')[0]}
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => navigate(`/profile/${activeOther._id}`)}
                          className="font-semibold text-sm hover:underline"
                        >
                          {activeOther.firstName} {activeOther.lastName}
                        </button>
                        <p className="text-xs text-muted">
                          {typing ? 'Typing…' : activeOther.headline || 'Vibe member'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                          <Skeleton className="h-10 w-48 rounded-2xl" />
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-muted">
                      No messages yet. Say hello!
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender._id === me?._id || msg.sender === (me?._id as any);
                      const showAvatar =
                        idx === 0 ||
                        (messages[idx - 1].sender._id || messages[idx - 1].sender) !==
                          (msg.sender._id || msg.sender);

                      return (
                        <div
                          key={msg._id}
                          className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                        >
                          {!isMe && showAvatar ? (
                            <Avatar
                              src={activeOther?.profileImage}
                              fallback={(activeOther?.firstName || '?')[0]}
                              size="sm"
                            />
                          ) : !isMe ? (
                            <div className="w-9" />
                          ) : null}
                          <div className={`max-w-[70%] group`}>
                            <div
                              className={`px-3.5 py-2 rounded-2xl text-sm ${
                                isMe
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-accent rounded-bl-md'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <div
                              className={`flex items-center gap-1 mt-0.5 text-[10px] text-muted opacity-0 group-hover:opacity-100 transition-opacity ${
                                isMe ? 'justify-end' : ''
                              }`}
                            >
                              <span>
                                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                              </span>
                              {isMe && (
                                msg.read ? (
                                  <CheckCheck className="h-3 w-3 text-primary" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Typing indicator */}
                {typing && (
                  <div className="px-4 pb-1">
                    <span className="text-xs text-muted italic">
                      {activeOther?.firstName} is typing…
                    </span>
                  </div>
                )}

                {/* Message Input */}
                <div className="p-3 border-t border-border">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={msgText}
                      onChange={(e) => handleTypingInput(e.target.value)}
                      placeholder="Write a message…"
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!msgText.trim() || sending}
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
