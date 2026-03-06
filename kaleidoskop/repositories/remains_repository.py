from receiver.serializers import RemainsReceiveSerializer

class RemainsRepository:
    def save_remains(self, data = dict[str, str]):
        remains = RemainsReceiveSerializer(data = data, many=True)
        if remains.is_valid():
            remains.save()
        else:
            pass # Тут вывести лог