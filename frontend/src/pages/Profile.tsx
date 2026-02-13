import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Briefcase, GraduationCap, Calendar, Pencil, Camera,
  Plus, Trash2, X, Check, MessageCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useSession } from '../context/SessionContext';
import { usersApi, connectionsApi, postsApi } from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Avatar } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../components/ui/dialog';
import PostCard from '../components/feed/PostCard';
import type { User, Post, ConnectionStatus } from '../types';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: me, refreshUser } = useSession();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('connect');
  const [connBusy, setConnBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  const isOwnProfile = !id || id === me?._id;

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      if (isOwnProfile) {
        const res = await usersApi.me();
        setProfile(res.data);
      } else {
        const res = await usersApi.getProfile(id!);
        setProfile(res.data);
        const statusRes = await connectionsApi.getStatus(id!);
        setConnStatus(statusRes.data.status as ConnectionStatus);
      }
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [id, isOwnProfile]);

  useEffect(() => {
    fetchProfile();
    // Also fetch this user's posts
    postsApi.feed().then((res) => {
      const userPosts = isOwnProfile
        ? res.data.posts.filter((p) => p.author._id === me?._id)
        : res.data.posts.filter((p) => p.author._id === id);
      setPosts(userPosts);
    }).catch(() => {});
  }, [fetchProfile, id, isOwnProfile, me?._id]);

  const handleConnect = async () => {
    if (!id || connBusy) return;
    setConnBusy(true);
    try {
      if (connStatus === 'connect') {
        await connectionsApi.send(id);
        setConnStatus('pending');
      } else if (connStatus === 'disconnect') {
        await connectionsApi.remove(id);
        setConnStatus('connect');
      }
    } catch {
      // ignore
    } finally {
      setConnBusy(false);
    }
  };

  const handleEditSave = async (formData: FormData) => {
    try {
      const res = await usersApi.updateProfile(formData);
      setProfile(res.data);
      refreshUser();
      setEditOpen(false);
    } catch (err) {
      console.error('Profile update failed', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
          <Card className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="pt-14 pb-6 px-6 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-lg font-semibold mb-2">User not found</p>
          <Button variant="outline" onClick={() => navigate('/feed')}>Go to feed</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        {/* Hero Card */}
        <Card className="overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-48 bg-linear-to-r from-teal-500 to-emerald-400">
            {profile.coverImage && (
              <img src={profile.coverImage} alt="Cover" className="h-full w-full object-cover" />
            )}
            {/* Avatar */}
            <div className="absolute -bottom-12 left-6">
              <div className="rounded-full border-4 border-card bg-card">
                <Avatar src={profile.profileImage} fallback={(profile.firstName || 'U')[0]} size="xl" />
              </div>
            </div>
          </div>

          <CardContent className="pt-14 pb-6 px-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.headline && (
                  <p className="text-muted mt-0.5">{profile.headline}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {profile.location}
                    </span>
                  )}
                  <span>{profile.connections?.length || 0} connections</span>
                  {profile.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Joined {format(new Date(profile.createdAt), 'MMM yyyy')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    <Pencil className="h-4 w-4 mr-1.5" />
                    Edit profile
                  </Button>
                ) : (
                  <>
                    {connStatus === 'disconnect' ? (
                      <Button variant="outline" onClick={handleConnect} disabled={connBusy}>
                        Connected
                      </Button>
                    ) : connStatus === 'pending' ? (
                      <Button variant="outline" disabled>
                        Pending
                      </Button>
                    ) : (
                      <Button onClick={handleConnect} disabled={connBusy}>
                        Connect
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/messages`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1.5" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="about">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-4 mt-4">
            {/* Skills */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">Skills</h3>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No skills added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Experience
                </h3>
                {profile.experience && profile.experience.length > 0 ? (
                  <div className="space-y-4">
                    {profile.experience.map((exp, i) => (
                      <div key={i}>
                        {i > 0 && <Separator className="mb-4" />}
                        <p className="font-medium">{exp.title}</p>
                        <p className="text-sm text-muted">{exp.company}</p>
                        {(exp.startDate || exp.endDate) && (
                          <p className="text-xs text-muted mt-0.5">
                            {exp.startDate} – {exp.endDate || 'Present'}
                          </p>
                        )}
                        {exp.description && (
                          <p className="text-sm mt-1">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No experience added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Education
                </h3>
                {profile.education && profile.education.length > 0 ? (
                  <div className="space-y-4">
                    {profile.education.map((edu, i) => (
                      <div key={i}>
                        {i > 0 && <Separator className="mb-4" />}
                        <p className="font-medium">{edu.college}</p>
                        {edu.degree && <p className="text-sm text-muted">{edu.degree}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}</p>}
                        {(edu.startYear || edu.endYear) && (
                          <p className="text-xs text-muted mt-0.5">
                            {edu.startYear} – {edu.endYear || 'Present'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No education added yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4 mt-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted">No posts to show.</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onUpdate={(updated) =>
                    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
                  }
                  onDelete={(postId) => setPosts((prev) => prev.filter((p) => p._id !== postId))}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      {isOwnProfile && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={profile}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}

/* ───────────────────────── Edit Profile Dialog ───────────────────────── */

interface EditDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: User;
  onSave: (data: FormData) => Promise<void>;
}

function EditProfileDialog({ open, onOpenChange, profile, onSave }: EditDialogProps) {
  const [firstName, setFirstName] = useState(profile.firstName || '');
  const [lastName, setLastName] = useState(profile.lastName || '');
  const [headline, setHeadline] = useState(profile.headline || '');
  const [location, setLocation] = useState(profile.location || '');
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [experience, setExperience] = useState(
    profile.experience || [{ title: '', company: '', description: '', startDate: '', endDate: '' }],
  );
  const [education, setEducation] = useState(
    profile.education || [{ college: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' }],
  );
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [coverImg, setCoverImg] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const profileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setHeadline(profile.headline || '');
      setLocation(profile.location || '');
      setSkills(profile.skills || []);
      setExperience(
        profile.experience?.length
          ? profile.experience
          : [{ title: '', company: '', description: '', startDate: '', endDate: '' }],
      );
      setEducation(
        profile.education?.length
          ? profile.education
          : [{ college: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' }],
      );
      setProfileImg(null);
      setCoverImg(null);
    }
  }, [open, profile]);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('firstName', firstName);
    fd.append('lastName', lastName);
    fd.append('headline', headline);
    fd.append('location', location);
    fd.append('skills', JSON.stringify(skills));
    fd.append('experience', JSON.stringify(experience.filter((e) => e.title || e.company)));
    fd.append('education', JSON.stringify(education.filter((e) => e.college || e.degree)));
    if (profileImg) fd.append('profileImage', profileImg);
    if (coverImg) fd.append('coverImage', coverImg);
    await onSave(fd);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Photo uploads */}
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => profileRef.current?.click()}>
              <Avatar
                src={profileImg ? URL.createObjectURL(profileImg) : profile.profileImage}
                fallback={(firstName || 'U')[0]}
                size="lg"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <input ref={profileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setProfileImg(e.target.files?.[0] || null)} />
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={() => coverRef.current?.click()}>
                <Camera className="h-3.5 w-3.5 mr-1.5" />
                Change cover
              </Button>
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCoverImg(e.target.files?.[0] || null)} />
              {coverImg && <p className="text-xs text-muted mt-1">{coverImg.name}</p>}
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">First name</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Last name</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Headline</label>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Full-Stack Developer | Open Source Contributor"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
            />
          </div>

          <Separator />

          {/* Skills */}
          <div>
            <label className="text-sm font-medium mb-2 block">Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <button
                    onClick={() => setSkills(skills.filter((s) => s !== skill))}
                    className="ml-0.5 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={addSkill}>Add</Button>
            </div>
          </div>

          <Separator />

          {/* Experience */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Experience</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setExperience([...experience, { title: '', company: '', description: '', startDate: '', endDate: '' }])
                }
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2 relative">
                  {experience.length > 1 && (
                    <button
                      onClick={() => setExperience(experience.filter((_, j) => j !== i))}
                      className="absolute top-2 right-2 text-muted hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <Input
                    placeholder="Job title"
                    value={exp.title || ''}
                    onChange={(e) => {
                      const copy = [...experience];
                      copy[i] = { ...copy[i], title: e.target.value };
                      setExperience(copy);
                    }}
                  />
                  <Input
                    placeholder="Company"
                    value={exp.company || ''}
                    onChange={(e) => {
                      const copy = [...experience];
                      copy[i] = { ...copy[i], company: e.target.value };
                      setExperience(copy);
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Start date"
                      value={exp.startDate || ''}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[i] = { ...copy[i], startDate: e.target.value };
                        setExperience(copy);
                      }}
                    />
                    <Input
                      placeholder="End date"
                      value={exp.endDate || ''}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[i] = { ...copy[i], endDate: e.target.value };
                        setExperience(copy);
                      }}
                    />
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={exp.description || ''}
                    onChange={(e) => {
                      const copy = [...experience];
                      copy[i] = { ...copy[i], description: e.target.value };
                      setExperience(copy);
                    }}
                    className="min-h-[60px]"
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Education */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Education</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setEducation([...education, { college: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' }])
                }
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2 relative">
                  {education.length > 1 && (
                    <button
                      onClick={() => setEducation(education.filter((_, j) => j !== i))}
                      className="absolute top-2 right-2 text-muted hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <Input
                    placeholder="College / University"
                    value={edu.college || ''}
                    onChange={(e) => {
                      const copy = [...education];
                      copy[i] = { ...copy[i], college: e.target.value };
                      setEducation(copy);
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Degree"
                      value={edu.degree || ''}
                      onChange={(e) => {
                        const copy = [...education];
                        copy[i] = { ...copy[i], degree: e.target.value };
                        setEducation(copy);
                      }}
                    />
                    <Input
                      placeholder="Field of study"
                      value={edu.fieldOfStudy || ''}
                      onChange={(e) => {
                        const copy = [...education];
                        copy[i] = { ...copy[i], fieldOfStudy: e.target.value };
                        setEducation(copy);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Start year"
                      value={edu.startYear || ''}
                      onChange={(e) => {
                        const copy = [...education];
                        copy[i] = { ...copy[i], startYear: e.target.value };
                        setEducation(copy);
                      }}
                    />
                    <Input
                      placeholder="End year"
                      value={edu.endYear || ''}
                      onChange={(e) => {
                        const copy = [...education];
                        copy[i] = { ...copy[i], endYear: e.target.value };
                        setEducation(copy);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
