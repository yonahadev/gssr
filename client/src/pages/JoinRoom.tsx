import { zodResolver } from "@hookform/resolvers/zod"; // @2.9.11
import { useForm } from "react-hook-form"; // @7.43
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { z } from "zod"; // @3.20.6
// import { Alert } from "react-bootstrap";

const schema = z.object({
  room: z.string().min(8).max(8).optional(),
  username: z.string().min(3).max(25),
});

type SignUpFormData = z.infer<typeof schema>;

interface Props {
  socket: Socket;
  setUser: React.Dispatch<React.SetStateAction<string>>;
}

const JoinRoom = ({ socket, setUser }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: SignUpFormData) => {
    joinRoom(data);
    reset();
  };

  const navigate = useNavigate();

  const joinRoom = async (data: SignUpFormData) => {
    const roomCode = await generateRoomCode();
    console.log(`Connected to ${roomCode} as ${data.username}`);
    socket.emit("join_room", roomCode);
    navigate(`/room/${roomCode}`);
  };

  const generateRoomCode = async () => {
    console.log("Send create room request");

    return new Promise((resolve) => {
      socket.on("created_room", (receivedRoomCode: number) => {
        const roomCode = receivedRoomCode;
        resolve(roomCode);
      });
      socket.emit("create_room");
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* <div className="mb-3">
          <label htmlFor="room" className="form-label">
            Room
          </label>
          <input
            {...register("room")}
            id="room"
            type="text"
            className="form-control"
            placeholder="Enter room name"
          />
          {errors.room && <p className="text-danger">{errors.room.message}</p>}
        </div> */}
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            {...register("username")}
            id="username"
            type="text"
            className="form-control"
            placeholder="Enter username"
          />
          {errors.username && (
            <p className="text-danger">{errors.username.message}</p>
          )}
        </div>
        {/* {error && (
        <Alert key="danger" variant="danger">
          {error}
        </Alert>
      )} */}
        <div className="d-grid">
          <button className="btn btn-primary">JOIN ROOM</button>
        </div>
      </form>
    </>
  );
};

export default JoinRoom;
