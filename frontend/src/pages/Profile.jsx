import { useState, useEffect, useRef } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiEdit3, FiSave, FiX, FiLock, FiCamera, FiCheck } from 'react-icons/fi';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  /* password */
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/users/profile');
        const data = res.data?.user || res.data;
        setProfile(data);
        setForm({
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          dob: data.dob ? data.dob.split('T')[0] : '',
          address: data.address || '',
        });
      } catch (err) {
        setMsg({ type: 'error', text: 'Failed to load profile.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);
      const res = await axios.put('/api/users/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated = res.data?.user || res.data;
      setProfile(updated);
      setEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setPwSaving(true);
    setPwMsg({ type: '', text: '' });
    try {
      await axios.put('/api/users/change-password', {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setPwSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (profile) {
      setForm({
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || '',
        dob: profile.dob ? profile.dob.split('T')[0] : '',
        address: profile.address || '',
      });
    }
  };

  // const getPhotoUrl = () => {
  //   if (photoPreview) return photoPreview;
  //   if (profile?.photo) {
  //     if (profile.photo.startsWith('http')) return profile.photo;
  //     return `/uploads/${profile.photo}`;
  //   }
  //   return `https://ui-avatars.com/api/?name=${profile?.username || 'U'}&background=d4a853&color=0a0a0f&size=200&bold=true`;
  // };
const getPhotoUrl = () => {
  if (photoPreview) return photoPreview;

  if (profile?.photo) {
    if (profile.photo.startsWith('http')) {
      return profile.photo;
    }

    const cleanPath = profile.photo.replace(/\\/g, '/');

    // return `http://localhost:5000/${cleanPath}`;
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  }

  return `https://ui-avatars.com/api/?name=${profile?.username || 'U'}&background=d4a853&color=0a0a0f&size=200&bold=true`;
};
  if (loading) {
    return (
      <div className="prof-loading">
        <div className="prof-spinner" />
        <p>Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="prof-container">
        {/* Profile Card */}
        <div className="prof-card">
          <div className="prof-card-header">
            <div className="prof-avatar-section">
              <div className="prof-avatar-wrap" onClick={() => editing && fileRef.current?.click()}>
                <img src={getPhotoUrl()} alt="Profile" className="prof-avatar-img" />
                {editing && (
                  <div className="prof-avatar-overlay">
                    <FiCamera size={24} />
                    <span>Change</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
              {!editing && (
                <>
                  <h2 className="prof-name">{profile?.username}</h2>
                  <p className="prof-email">{profile?.email}</p>
                </>
              )}
            </div>
            <button className="prof-edit-toggle" onClick={() => editing ? cancelEdit() : setEditing(true)}>
              {editing ? <><FiX /> Cancel</> : <><FiEdit3 /> Edit Profile</>}
            </button>
          </div>

          {msg.text && <div className={`prof-msg ${msg.type}`}>{msg.type === 'success' ? <FiCheck /> : null} {msg.text}</div>}

          <div className="prof-fields">
            {[
              { name: 'username', label: 'Username', icon: <FiUser />, type: 'text' },
              { name: 'email', label: 'Email', icon: <FiMail />, type: 'email' },
              { name: 'phone', label: 'Phone', icon: <FiPhone />, type: 'tel' },
              { name: 'dob', label: 'Date of Birth', icon: <FiCalendar />, type: 'date' },
              { name: 'address', label: 'Address', icon: <FiMapPin />, type: 'text' },
            ].map(f => (
              <div key={f.name} className="prof-field">
                <label className="prof-field-label">{f.icon} {f.label}</label>
                {editing ? (
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name] || ''}
                    onChange={handleChange}
                    className="prof-field-input"
                  />
                ) : (
                  <p className="prof-field-value">{form[f.name] || '—'}</p>
                )}
              </div>
            ))}
          </div>

          {editing && (
            <button className="prof-save-btn" onClick={handleSave} disabled={saving}>
              <FiSave /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          )}
        </div>

        {/* Change Password */}
        <div className="prof-pw-card">
          <h3><FiLock /> Change Password</h3>
          {pwMsg.text && <div className={`prof-msg ${pwMsg.type}`}>{pwMsg.text}</div>}
          <form onSubmit={handlePasswordChange} className="prof-pw-form">
            <div className="prof-pw-field">
              <label>Current Password</label>
              <input
                type="password"
                value={pwForm.oldPassword}
                onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                required
              />
            </div>
            <div className="prof-pw-field">
              <label>New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="prof-pw-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <button type="submit" disabled={pwSaving} className="prof-pw-submit">
              <FiLock /> {pwSaving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
