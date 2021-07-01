import { useEffect} from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Button } from '../components/Button';
import { Question } from '../components/Question';
import RoomCode from '../components/RoomCode'
import { Toaster } from 'react-hot-toast';
// import { useAuth } from '../hooks/useAuth';

import logoImg from '../assets/images/logo.svg'
import deleteImg from '../assets/images/delete.svg'
import checkImg from '../assets/images/check.svg'
import answerImg from '../assets/images/answer.svg'

import '../styles/room.scss'
import { useRoom } from '../hooks/useRoom';
import { database } from '../services/firebase';
// import toast from 'react-hot-toast';

type RoomParams = {
    id: string;
}

export function AdminRoom(){
    // const {user} = useAuth();
    const params = useParams<RoomParams>();
    const history = useHistory()

    const roomId = params.id;
    const {questions, title} = useRoom(roomId)

    useEffect(() => {
        const roomRef = database.ref(`rooms/${roomId}/questions/`);

        roomRef.on('child_added', (room) => {
            const notificationQuestion = room.val()
            return console.log(notificationQuestion)
            // const firebaseQuestions : FirebaseQuestions= databaseRoom.questions ?? {};
        })

        return console.log('passou')

    }, [questions, roomId])

    async function handleEndRoom () {
       await  database.ref(`rooms/${roomId}`).update({
            endedAt: new Date()
        })

        history.push('/');
    }

    async function handleCheckQuestionAsAnswered(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isAnswered: true,
        })
    }

    async function handleHighlightQuestion(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isHighlighted: true,
        })
    }
    
    async function handleDeleteQuestion(questionId: string) {
        if (window.confirm('Tem certeza que você deseja excluir esta pergunta?')) {
            await database.ref(`rooms/${roomId}/questions/${questionId}`).remove()
        }
    }

    return(
        <div id="page-room">
            <Toaster/>
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask"/>
                    <div>                    
                        <RoomCode code={roomId}/>
                        <Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
                    </div>
                </div>
            </header>
            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && <span>{questions.length} Pergunta(s)</span>}
                </div>

                {questions.length === 0 && (
                    <div className="separator">Nenhuma pergunta no momento.</div>
                )}
                
                <div className="question-list">                
                    {questions.map(question => {
                        return (
                            <Question 
                                key={question.id}
                                content={question.content}
                                author={question.author}
                                isAnswered={question.isAnswered}
                                isHighlighted={question.isHighlighted}
                            >
                                {!question.isAnswered && (  
                                    <>                              
                                        <button
                                            type="button"
                                            onClick={() => handleCheckQuestionAsAnswered(question.id)}
                                        >
                                            <img src={checkImg} alt="Marcar pergunta como respondida" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleHighlightQuestion(question.id)}
                                        >
                                            <img src={answerImg} alt="Dar destaque à pergunta" />
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(question.id)}
                                >
                                    <img src={deleteImg} alt="Remover pergunta" />
                                </button>
                            </Question>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}