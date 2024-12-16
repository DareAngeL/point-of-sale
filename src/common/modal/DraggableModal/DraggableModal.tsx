import Draggable from 'react-draggable'

interface DraggableModalProps {
    children: React.ReactNode;
    isOpen: boolean;
}

// const styles = {
//     modal: {
//         position: 'absolute',
//         width: '300px',
//         height: '200px',
//         backgroundColor: '#e3e3e3',
//         border: '4px solid #ccc',
//         padding: '20px',
//         // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
//     }
// }


export const DraggableModal = ({children, isOpen}: DraggableModalProps) => {
  if (!isOpen) return null;
  

    return (
      <Draggable defaultPosition={{x: window.innerWidth / 2 - 150, y: 0}}>
        <div style={{
            position: 'absolute',
            width: '300px',
            height: '80px',
            backgroundColor: '#f7f7f7',
            border: '1px solid #000000',
            zIndex: 100,
            padding: "5px",
            cursor: "pointer"
        }}>
          <div className=''>
            {children}
          </div>
        </div>
      </Draggable>
    );
};
    
    