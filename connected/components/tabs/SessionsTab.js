// components/tabs/SessionsTab.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import supabase from '../../supabaseClient';
import { colors, Icons } from '../../constants/theme';

/* ===========================
   Helpers
=========================== */

const fmtTime = (d) => {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => {
  const aS = new Date(aStart).getTime();
  const aE = new Date(aEnd).getTime();
  const bS = new Date(bStart).getTime();
  const bE = new Date(bEnd).getTime();
  return aS < bE && bS < aE;
};

/* ===========================
   Input Component
=========================== */

const Input = ({ style, ...props }) => {
  return (
    <View style={[modalStyles.input, style]}>
      <TextInput
        {...props}
        style={{ paddingVertical: 8, paddingHorizontal: 10, fontSize: 14 }}
        placeholderTextColor="#999"
      />
    </View>
  );
};

/* ===========================
   Session Modal Component
=========================== */

const SessionModal = ({
  title,
  initialValue,
  onClose,
  onSubmit,
  rooms,
  speakers,
  busy,
}) => {
  const [form, setForm] = useState(() => ({
    title: initialValue?.title || '',
    description: initialValue?.description || '',
    room_id: initialValue?.room_id || (rooms[0]?.id ?? null),
    speaker_id: initialValue?.speaker_id || null,
    tags: initialValue?.tags || '',
    start_time: initialValue?.start_time ? new Date(initialValue.start_time) : new Date(),
    end_time: initialValue?.end_time
      ? new Date(initialValue.end_time)
      : new Date(Date.now() + 60 * 60 * 1000),
  }));

  // Separate state for picker visibility and type
  const [datePickerState, setDatePickerState] = useState({
    show: false,
    mode: 'date', // 'date' or 'time'
    field: null, // 'start' or 'end'
  });

  const [tagsOpen, setTagsOpen] = useState(false);
  const [tagsValue, setTagsValue] = useState(form.tags || '');
  const [tagsItems, setTagsItems] = useState([
    { label: 'Keynote', value: 'keynote' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Panel', value: 'panel' },
    { label: 'Masterclass', value: 'masterclass' },
  ]);

  const onChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  // Close any open pickers when tags dropdown opens
  const handleTagsOpen = (open) => {
    if (open) {
      setDatePickerState({ show: false, mode: 'date', field: null });
    }
    setTagsOpen(open);
  };

  // Improved date picker handler
  const handleDateTimeChange = (event, selectedDate) => {
    console.log('DateTimePicker event:', event?.type, selectedDate);
    
    // Always hide picker on Android after selection
    if (Platform.OS === 'android') {
      setDatePickerState({ show: false, mode: 'date', field: null });
    }

    // Only process valid selections (not dismissals)
    if (event?.type === 'set' && selectedDate && datePickerState.field) {
      const fieldName = datePickerState.field === 'start' ? 'start_time' : 'end_time';
      onChange(fieldName, selectedDate);
    }

    // For iOS, hide picker after any interaction
    if (Platform.OS === 'ios' && event?.type !== 'set') {
      setDatePickerState({ show: false, mode: 'date', field: null });
    }
  };

  const showDatePicker = (field) => {
    // Close tags dropdown if open
    setTagsOpen(false);
    
    setDatePickerState({
      show: true,
      mode: 'datetime',
      field: field,
    });
  };

  const submit = () => {
    if (!form.title?.trim()) {
      Alert.alert('Validation', 'Please enter a title.');
      return;
    }
    if (!form.room_id) {
      Alert.alert('Validation', 'Please select a room.');
      return;
    }
    if (!form.start_time || !form.end_time || form.end_time <= form.start_time) {
      Alert.alert('Validation', 'End time must be after start time.');
      return;
    }
    const payload = {
      ...form,
      start_time: form.start_time.toISOString(),
      end_time: form.end_time.toISOString(),
      tags: tagsValue || '',
    };

    onSubmit(payload);
  };

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={modalStyles.title}>{title}</Text>

          {/* Title */}
          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Title</Text>
            <Input value={form.title} onChangeText={(v) => onChange('title', v)} />
          </View>

          {/* Description */}
          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Description</Text>
            <Input
              value={form.description}
              onChangeText={(v) => onChange('description', v)}
              multiline
            />
          </View>

          {/* Room */}
          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Room</Text>
            <View style={modalStyles.pickerWrap}>
              <Picker
                selectedValue={form.room_id}
                onValueChange={(v) => onChange('room_id', v)}
              >
                {rooms.map((r) => (
                  <Picker.Item key={r.id} label={`${r.room_name} (${r.capacity})`} value={r.id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Speaker */}
          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Speaker</Text>
            <View style={modalStyles.pickerWrap}>
              <Picker
                selectedValue={form.speaker_id}
                onValueChange={(v) => onChange('speaker_id', v)}
              >
                <Picker.Item label="— None —" value={null} />
                {speakers.map((s) => (
                  <Picker.Item key={s.id} label={s.full_name} value={s.id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Tags */}
          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Tags</Text>
            <DropDownPicker
              open={tagsOpen}
              value={tagsValue}
              items={tagsItems}
              setOpen={handleTagsOpen}
              setValue={(value) => {
                setTagsValue(value);
                onChange('tags', value);
              }}
              setItems={setTagsItems}
              multiple={false}
              mode="BADGE"
              badgeDotColors={['#2e7d32', '#f9a825', '#c62828']}
              placeholder="Select tags"
              style={{ borderColor: '#e3e3e3', borderRadius: 10, backgroundColor: '#fafafa' }}
              dropDownContainerStyle={{ borderColor: '#e3e3e3', borderRadius: 10 }}
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>

          {/* Start & End Time */}
          <View style={modalStyles.fieldRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={modalStyles.label}>Start</Text>
              <TouchableOpacity
                style={modalStyles.timeBtn}
                onPress={() => showDatePicker('start')}
                disabled={tagsOpen}
              >
                <Text style={modalStyles.timeBtnText}>{fmtTime(form.start_time)}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={modalStyles.label}>End</Text>
              <TouchableOpacity
                style={modalStyles.timeBtn}
                onPress={() => showDatePicker('end')}
                disabled={tagsOpen}
              >
                <Text style={modalStyles.timeBtnText}>{fmtTime(form.end_time)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date/Time Picker */}
          {datePickerState.show && (
            <DateTimePicker
              value={datePickerState.field === 'start' ? form.start_time : form.end_time}
              mode={datePickerState.mode}
              display={Platform.OS === 'ios' ? 'compact' : 'default'}
              onChange={handleDateTimeChange}
              minimumDate={new Date()}
              textColor={Platform.OS === 'ios' ? colors.text : undefined}
            />
          )}

          <View style={modalStyles.row}>
            <TouchableOpacity 
              style={[modalStyles.btn, modalStyles.cancel]} 
              onPress={onClose} 
              disabled={busy}
            >
              <Text style={modalStyles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[modalStyles.btn, modalStyles.save]} 
              onPress={submit} 
              disabled={busy}
            >
              <Text style={modalStyles.btnText}>{busy ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

/* ===========================
   Main Sessions Tab Component - UPDATED WITH SYNC SUPPORT
=========================== */

const SessionsTab = ({ 
  // Passed props from parent for synchronization
  rooms = [], 
  speakers = [], 
  sessions = [], 
  setSessions,
  occupancyMap = {},
  onSessionChange, // Callback to notify parent of session changes
  fetchSessions, // Function to refresh sessions
  userRole = 'admin'
}) => {
  const [loading, setLoading] = useState(false); // Changed from true to false since data comes from props
  const [busy, setBusy] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editSession, setEditSession] = useState(null);

  // If sessions data is managed by parent, we don't need to fetch it here
  // But we still need initial load if sessions array is empty
  useEffect(() => {
    if (sessions.length === 0 && fetchSessions) {
      setLoading(true);
      fetchSessions().finally(() => setLoading(false));
    }
  }, [sessions.length, fetchSessions]);

  const roomById = useMemo(() => {
    const m = new Map();
    rooms.forEach((r) => m.set(r.id, r));
    return m;
  }, [rooms]);

  const speakerById = useMemo(() => {
    const m = new Map();
    speakers.forEach((s) => m.set(s.id, s));
    return m;
  }, [speakers]);

  const validateConflict = (payload, excludeId = null) => {
    if (!payload.room_id || !payload.start_time || !payload.end_time) return null;
    const siblings = sessions.filter(
      (s) => s.room_id === payload.room_id && s.id !== excludeId
    );
    const conflict = siblings.find((s) =>
      overlaps(payload.start_time, payload.end_time, s.start_time, s.end_time)
    );
    return conflict || null;
  };

  const addSession = async (payload) => {
    if (busy) return;
    setBusy(true);
    try {
      const conflict = validateConflict(payload);
      if (conflict) {
        Alert.alert(
          'Schedule conflict',
          `Another session ("${conflict.title}") is already in this room during that time.`
        );
        return;
      }

      const { data, error } = await supabase.from('sessions').insert({
        title: payload.title,
        description: payload.description || null,
        start_time: payload.start_time,
        end_time: payload.end_time,
        room_id: payload.room_id,
        speaker_id: payload.speaker_id || null,
        tags: payload.tags || null,
      }).select();

      if (error) throw error;

      // Update local state immediately for better UX
      if (setSessions && data && data[0]) {
        setSessions(prevSessions => [...prevSessions, data[0]]);
      }

      // Notify parent component of the change
      if (onSessionChange) {
        onSessionChange('add', data[0]);
      }

      // Refresh sessions if function is available
      if (fetchSessions) {
        await fetchSessions();
      }

      setShowAddModal(false);
      Alert.alert('Success', 'Session added.');
    } catch (e) {
      console.error('Add error:', e);
      Alert.alert('Error', e.message || 'Failed to add session.');
    } finally {
      setBusy(false);
    }
  };

  const updateSession = async (id, payload) => {
    if (busy) return;
    setBusy(true);
    try {
      const conflict = validateConflict(payload, id);
      if (conflict) {
        Alert.alert(
          'Schedule conflict',
          `Another session ("${conflict.title}") is already in this room during that time.`
        );
        return;
      }

      const { data, error } = await supabase
        .from('sessions')
        .update({
          title: payload.title,
          description: payload.description || null,
          start_time: payload.start_time,
          end_time: payload.end_time,
          room_id: payload.room_id,
          speaker_id: payload.speaker_id || null,
          tags: payload.tags || null,
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      // Update local state immediately
      if (setSessions && data && data[0]) {
        setSessions(prevSessions => 
          prevSessions.map(session => 
            session.id === id ? data[0] : session
          )
        );
      }

      // Notify parent component of the change
      if (onSessionChange) {
        onSessionChange('update', data[0]);
      }

      // Refresh sessions if function is available
      if (fetchSessions) {
        await fetchSessions();
      }

      setEditSession(null);
      Alert.alert('Success', 'Session updated.');
    } catch (e) {
      console.error('Update error:', e);
      Alert.alert('Error', e.message || 'Failed to update session.');
    } finally {
      setBusy(false);
    }
  };

  const deleteSession = (id, title) => {
    Alert.alert(
      'Delete session',
      `Delete "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setBusy(true);
              const { error } = await supabase.from('sessions').delete().eq('id', id);
              if (error) throw error;

              // Update local state immediately
              if (setSessions) {
                setSessions(prevSessions => 
                  prevSessions.filter(session => session.id !== id)
                );
              }

              // Notify parent component of the change
              if (onSessionChange) {
                onSessionChange('delete', { id, title });
              }

              // Refresh sessions if function is available
              if (fetchSessions) {
                await fetchSessions();
              }

              Alert.alert('Deleted', 'Session removed.');
            } catch (e) {
              console.error('Delete error:', e);
              Alert.alert('Error', e.message || 'Failed to delete session.');
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  const renderStatusPill = (roomId) => {
    const room = roomById.get(roomId);
    if (!room) return null;

    const occ = occupancyMap[roomId] || 0;
    const capacity = room.capacity || 0;
    let status = 'normal';
    if (capacity > 0) {
      const ratio = occ / capacity;
      if (ratio > 0.9) status = 'critical';
      else if (ratio > 0.7) status = 'warning';
    }

    const style =
      status === 'critical'
        ? styles.pillCritical
        : status === 'warning'
          ? styles.pillWarning
          : styles.pillNormal;

    return (
      <View style={[styles.pill, style]}>
        <Text style={styles.pillText}>
          {capacity ? `${occ}/${capacity}` : `${occ}`} {status.toUpperCase()}
        </Text>
      </View>
    );
  };

  // Helper function to get current session for a room
  const getCurrentSession = (roomId) => {
    const now = new Date();
    return sessions.find(session => 
      session.room_id === roomId && 
      new Date(session.start_time) <= now && 
      new Date(session.end_time) >= now
    );
  };

  // Helper function to get next session for a room
  const getNextSession = (roomId) => {
    const now = new Date();
    return sessions
      .filter(session => 
        session.room_id === roomId && 
        new Date(session.start_time) > now
      )
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading sessions…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
        {/* Sessions List */}
        {sessions.map((s) => {
          const room = roomById.get(s.room_id);
          const speaker = speakerById.get(s.speaker_id);

          return (
            <View key={s.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{s.title}</Text>
                {renderStatusPill(s.room_id)}
              </View>

              <Text style={styles.meta}>
                {Icons.locationPin || '📍'} Room: <Text style={styles.metaBold}>{room?.room_name || '—'}</Text>
              </Text>
              <Text style={styles.meta}>
                {Icons.person || '👤'} Speaker: <Text style={styles.metaBold}>{speaker?.full_name || '—'}</Text>
              </Text>
              <Text style={styles.meta}>
                {Icons.clock || '🕒'} {fmtTime(s.start_time)} — {fmtTime(s.end_time)}
              </Text>

              {s.description ? <Text style={styles.desc}>{s.description}</Text> : null}
              {s.tags ? (
                <View style={styles.tagsContainer}>
                  <Text style={styles.tagPill}>{s.tags}</Text>
                </View>
              ) : null}

              {userRole === 'admin' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnEdit]}
                    onPress={() => setEditSession(s)}
                  >
                    <Text style={styles.btnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnDelete]}
                    onPress={() => deleteSession(s.id, s.title)}
                  >
                    <Text style={styles.btnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
        {sessions.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No sessions scheduled yet.</Text>
            <Text style={styles.emptySubtext}>
              {userRole === 'admin' 
                ? 'Tap the + button to add your first session.' 
                : 'Sessions will appear here when they are scheduled.'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {userRole === 'admin' && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Text style={styles.fabText}>{Icons.plus || '+'}</Text>
        </TouchableOpacity>
      )}

      {showAddModal && (
        <SessionModal
          title="Add Session"
          initialValue={null}
          onClose={() => setShowAddModal(false)}
          onSubmit={addSession}
          rooms={rooms}
          speakers={speakers}
          busy={busy}
        />
      )}
      {editSession && (
        <SessionModal
          title="Edit Session"
          initialValue={editSession}
          onClose={() => setEditSession(null)}
          onSubmit={(payload) => updateSession(editSession.id, payload)}
          rooms={rooms}
          speakers={speakers}
          busy={busy}
        />
      )}
    </View>
  );
};

// Export helper functions for use in RoomsTab
export const sessionHelpers = {
  getCurrentSession: (sessions, roomId) => {
    const now = new Date();
    return sessions.find(session => 
      session.room_id === roomId && 
      new Date(session.start_time) <= now && 
      new Date(session.end_time) >= now
    );
  },
  
  getNextSession: (sessions, roomId) => {
    const now = new Date();
    return sessions
      .filter(session => 
        session.room_id === roomId && 
        new Date(session.start_time) > now
      )
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];
  },
  
  getSessionsForRoom: (sessions, roomId) => {
    return sessions.filter(session => session.room_id === roomId)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollPad: {
    padding: 15,
    paddingBottom: 100,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 18,
    color: colors.text,
    lineHeight: 22,
  },
  meta: {
    color: colors.textSecondary,
    marginBottom: 6,
    fontSize: 14,
    lineHeight: 18,
  },
  metaBold: {
    fontWeight: '600',
    color: colors.text,
  },
  desc: {
    marginTop: 10,
    color: colors.textSecondary,
    lineHeight: 20,
    fontSize: 14,
  },
  tagsContainer: {
    marginTop: 8,
  },
  tagPill: {
    backgroundColor: colors.lightPink,
    color: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  actions: {
    marginTop: 15,
    flexDirection: 'row',
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  btnEdit: {
    backgroundColor: colors.primary,
  },
  btnDelete: {
    backgroundColor: colors.error,
  },
  btnText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabText: {
    color: colors.background,
    fontSize: 24,
    fontWeight: 'bold',
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  pillText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 10,
  },
  pillNormal: {
    backgroundColor: colors.success,
  },
  pillWarning: {
    backgroundColor: colors.warning,
  },
  pillCritical: {
    backgroundColor: colors.error,
  },
  empty: {
    marginTop: 80,
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.lightPink,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.lightPink,
    overflow: 'hidden',
  },
  timeBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.lightPink,
  },
  timeBtnText: {
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginLeft: 10,
  },
  cancel: {
    backgroundColor: colors.textSecondary,
  },
  save: {
    backgroundColor: colors.primary,
  },
  btnText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SessionsTab;