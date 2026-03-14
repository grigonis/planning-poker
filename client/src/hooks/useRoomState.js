import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useRoomState = (roomId) => {
    const location = useLocation();
    
    const [viewState, setViewState] = useState(
        location.state?.userId ? 'ROOM' : 'LOADING'
    );
    const [users, setUsers] = useState(location.state?.users || []);
    const [phase, setPhase] = useState('IDLE');
    const [votes, setVotes] = useState({});
    const [myVote, setMyVote] = useState(null);
    const [averages, setAverages] = useState({});
    const [groupAverages, setGroupAverages] = useState([]);
    const [activeReactions, setActiveReactions] = useState({});
    const [roomMode, setRoomMode] = useState(location.state?.gameMode || 'STANDARD');
    const [funFeatures, setFunFeatures] = useState(location.state?.funFeatures || false);
    const [autoReveal, setAutoReveal] = useState(location.state?.autoReveal || false);
    const [anonymousMode, setAnonymousMode] = useState(location.state?.anonymousMode || false);
    const [votingSystem, setVotingSystem] = useState(location.state?.votingSystem || {
        type: 'FIBONACCI_MODIFIED',
        name: 'Modified Fibonacci',
        values: [0, 0.5, 1, 2, 3, 5, 8, 13, 21, '☕']
    });
    const [roomName, setRoomName] = useState(location.state?.roomName || '');
    const [roomDescription, setRoomDescription] = useState(location.state?.roomDescription || '');
    const [groups, setGroups] = useState(location.state?.groups || []);
    const [groupsEnabled, setGroupsEnabled] = useState(location.state?.groupsEnabled || false);

    const [isTasksOpen, setIsTasksOpen] = useState(
        localStorage.getItem(`keystimate_tasks_open_${roomId}`) === 'true'
    );

    const [tasks, setTasks] = useState(location.state?.tasks || []);
    const [activeTaskId, setActiveTaskId] = useState(location.state?.activeTaskId || null);
    const [currentUser, setCurrentUser] = useState(location.state || {});

    const audioCtxRef = useRef(null);

    return {
        viewState, setViewState,
        users, setUsers,
        phase, setPhase,
        votes, setVotes,
        myVote, setMyVote,
        averages, setAverages,
        groupAverages, setGroupAverages,
        activeReactions, setActiveReactions,
        roomMode, setRoomMode,
        funFeatures, setFunFeatures,
        autoReveal, setAutoReveal,
        anonymousMode, setAnonymousMode,
        votingSystem, setVotingSystem,
        roomName, setRoomName,
        roomDescription, setRoomDescription,
        groups, setGroups,
        groupsEnabled, setGroupsEnabled,
        isTasksOpen, setIsTasksOpen,
        tasks, setTasks,
        activeTaskId, setActiveTaskId,
        currentUser, setCurrentUser,
        audioCtxRef
    };
};
